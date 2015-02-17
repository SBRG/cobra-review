"""Generates data.json and map_statistics.json from a spreadsheet.

"""
import pandas as pd
from collections import defaultdict
import json, csv, urllib2, time
from tl.rename.case import transform_sentence_case
import re
import numpy as np
    
def read_excel(filename, sheet):
    # read excel file
    with open(filename, 'r') as f:
        papers = pd.io.excel.read_excel(f, skiprows=1)
    # papers = papers.rename(columns={'PMID/filename': 'PMID',
    #                                 'Type of Data?': "High-throughput data integration"})
    papers = papers.dropna(axis=0,how='all').fillna(0)

    def add_columns(p, initial_column, count, new_column):
        """Starting with initial_column, concatenated count columns, and put strings in
        new_column."""
        types = []
        i = list(p.columns).index(initial_column)
        for r in p[range(i, i+count)].itertuples(index=False):
            inds = [a for a, v in enumerate(r) if v != 0 and v is not None]
            types.append(", ".join([list(p.columns)[i+ind] for ind in inds])) # fix
        return pd.concat([p, pd.DataFrame(types, columns=[new_column])], axis=1)
    
    papers = add_columns(papers, 'biochemical', 24, 'Keywords')
    return papers

def dump_spreadsheet(papers):
    """ Convert xlsx file to json array.

    Outputs data.json.
    
    """
    out_file = "data.json"

    def func(x):
        if x==0:
            return ''
        return '<a href="http://dx.doi.org/%s" target="_blank">%s</a>' % (x,x)
    papers['DOI'] = papers['DOI'].map(func)

    header = []; cols = [] 

    cols_in_order = ["Authors", "Title", "Journal", "Year", "Volume (Issue), Pages SI", "DOI",
                     "Notes", "Keywords"]
    number_cols = ["Year"]
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

    # fix numpy ints
    for y in papers['Year']:
        try:
            y = int(y)
        except ValueError:
            y = 0
    
    # add all authors
    name = 'authors_all'
    papers[name] = papers['Authors']
    header.append({'name': name, 'type': 'string'})
    cols.append(name)
        
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

    # remove nan
    papers = papers.fillna(0)

    # sort by year
    data = list([list(x) for x in papers[cols].itertuples(index=False)])
    # flag = True
    for i, d in enumerate(data):
        for j, e in enumerate(d):
            # if flag and isinstance(e, int):
            #     e = np.int32(e)
            #     data[i][j] = e
            #     flag = False
            try:
                json.dumps(e)
            except TypeError:
                data[i][j] = int(e)
    data.sort(key = lambda c: c[4])
    with open(out_file,'w') as file:
        json.dump({'header':header,
                   'data': data},
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

if __name__ == '__main__':
    in_file = "spreadsheet/all_P.t._topic_revision_for_database_editing_shared_V34_11.02.2015.xlsx"
    sheet = "Pt Database"
    papers = read_excel(in_file, sheet)
    dump_spreadsheet(papers)
    # dump_geo(papers)
