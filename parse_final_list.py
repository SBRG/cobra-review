"""Generates data.json and map_statistics.json from FinalList.xlsx

"""

from sys import argv
import pandas as pd
from collections import defaultdict
import json, csv, urllib2, time
from tl.rename.case import transform_sentence_case
import re
    
def read_excel(filename):
    # read excel file
    xls = pd.ExcelFile(in_file)
    papers = xls.parse('Sheet1', skiprows=1)
    papers = papers.rename(columns={'PMID/filename': 'PMID',
                                    'Type of Data?': "High-throughput data integration"})
    papers = papers.dropna(axis=0,how='all').fillna(0)

    def add_columns(p, initial_column, count, new_column):
        types = []
        i = list(p.columns).index(initial_column)
        for r in p[range(i, i+count)].itertuples(index=False):
            inds = [a for a, v in enumerate(r) if v != 0 and v is not None]
            types.append(", ".join([list(p.columns)[i+ind] for ind in inds])) # fix
        return pd.concat([p, pd.DataFrame(types, columns=[new_column])], axis=1)
    
    papers = add_columns(papers, 'Flux Phenotype', 13, 'Computational Prediction')
    papers = add_columns(papers, 'Met Eng', 5, 'Prediction Application')
    papers = add_columns(papers, 'Legacy Data', 2, 'Consistent with experiments')
    return papers

def dump_spreadsheet(papers):
    """ Convert xlsx file to json array.

    Outputs data.json.
    
    """
    out_file = "data.json"

    def func(s):
        try:
            x = int(s)
            return '<a href="http://www.ncbi.nlm.nih.gov/pubmed?' + \
                   'term=%d" target="_blank">%d</a>' % (x,x)
        except ValueError:
            return ""
    papers['PMID'] = papers['PMID'].map(func)

    header = []; cols = [] 

    cols_in_order = ["Great papers", "Authors", "Title", "Journal", "Year", "PMID",
                   "Computational Prediction", "High-throughput data integration",
                   "Prediction Application", "Consistent with experiments", "Organism",
                   "Location", "Short Description"]
    number_cols = ["Year", "Total Citations"]
    for a in cols_in_order:
        if a not in papers.columns:
            print 'No columns named: %s' % a
            continue
        if a in number_cols:
            header.append({'name': a, 'type': 'number'})
            cols.append(a)
        else:
            header.append({'name': a, 'type': 'string'})
            cols.append(a)
            papers[a] = papers[a].map(lambda x: "%s"%x if x!=0 else "")

    # fix case
    papers['Journal'] = papers['Journal'].map(lambda x: x.title())
    papers['Title'] = papers['Title'].map(lambda x: transform_sentence_case([x])[0])
    papers['Short Description'] = [description if great!="" else ""
                                   for (description, great)
                                   in zip(papers['Short Description'], papers['Great papers'])]
        
    def title_except(s, min_length=4):
        word_list = re.split(' ', s)
        final = []
        for word in word_list:
            final.append(word.title() if len(word)>=min_length else word)
        return " ".join(final)
    def et_al(s, max_authors=4):
        author_list = re.split(';', s)
        if len(author_list) > max_authors:
            author_list = author_list[0:max_authors-1]
            r = ";<br/>".join(author_list) 
            r += '; <i>et al.</i>'
        else:
            r = ";<br/>".join(author_list) 
        return r
    papers['Authors'] = papers['Authors'].map(lambda x: et_al(title_except(x)))
            
    with open(out_file,'w') as file:
        json.dump({'header':header,
                   'data': list(papers[cols].itertuples(index=False))},
                   file,
                   allow_nan=False) 

def dump_geo(papers):
    """Calculate lat and long for places in the spreadsheet

    Outputs map_statistics.json

    """
    # get latitudes and longitudes
    lat = {}; lng = {}
    for k in papers['Location']:
        time.sleep(0.5)
        response = urllib2.urlopen("http://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=false" %
                                   k.encode('ascii', 'ignore').replace(' ', '+'))
        j = json.loads(response.read())
        if j['status'] != u'OK':
            print 'status %s' % j['status']
            continue
        r = j['results']
        try:
            r = r[0]
        except IndexError:
            pass
        location = r["geometry"]["location"]
        lat[k] = location["lat"]
        lng[k] = location["lng"]
    # output to json file
    output_filename = "map_statistics.json"
    array = [['Lat', 'Long', 'Location', 'Papers']]
    for i in papers[['Location', 'Title']]:
        try:
            array.append([lat[i[0]], lng[i[0]], unicode(k, 'ISO-8859-1'), i[1]])
        except KeyError:
            continue
    with open(output_filename, 'w') as file:
        json.dump(array, file)

# def sort_categories():
#     import csv, sys, re
#     file_name_in = sys.argv[1]
#     file = open(file_name_in, 'rU')
#     x = []; header = []
#     for i, row in enumerate(csv.reader(file)):
#         if i<=0:
#             header = row
#         else:
#             x.append(row)
#     file.close()
#     c = []
#     for row in x:
#         th = [a for i, a in enumerate(header) if row[i]!=""]
#         c.append('"' + ", ".join(th) + '"')
#     file_name_out = file_name_in.replace('.csv','_out.csv')
#     with open(file_name_out, 'w') as out_file:
#         for s in c:
#             out_file.write("%s\n" % s)

def modify_links(papers):
    """Adds target=_blank to links so that they appear in a new window

    """
    with open('data.json', 'r') as file:
        data = json.load(file) 
    for d in data['data']:
        pmid = d[4]
        link = '<a href=\"http://www.ncbi.nlm.nih.gov/pubmed?term=' + pmid + '\" target=\"_blank\">' + pmid + '</a>'
        d[4] = link 
    with open('datas.json', 'w') as file:
        json_file = json.dump(data, file)
    return papers
    
def add_citations(papers):
    # papers['header'].append({u'name': u'Citations', u'type': u'string'})
    # for d in papers['data']:
    #     d.append('citations')
    #     print d
    return papers
            
if __name__ == '__main__':
    if len(argv) < 2:
        raise Exception('Script needs an xlsx file')
    in_file = argv[1]
    papers = read_excel(in_file)
    # papers = add_citations(papers)
    # papers = modify_links(papers)
    dump_spreadsheet(papers)
    # dump_geo(papers)
