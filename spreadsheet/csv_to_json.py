from sys import argv
import json, csv
from IPython import embed

def dump_json(in_file):
    """ convert csv file to json array
    """
    out_file = in_file.replace('csv','json')
    data = []; header = []; names = []; types = []
    with open(in_file, 'Ur') as file:
        for i, row in enumerate(csv.reader(file)):
            if not bool([a for a in row if a!=""]):
                break
            r = []
            for j, field in enumerate(row):
                field = unicode(field, 'ISO-8859-1')
                try:
                    if types[j]=="number":
                        field = float(field)
                except IndexError:
                    pass
                r.append(field)
            if i == 0:
                names = r
            elif i == 1:
                types = r
            else:
                data.append(r)
        for i, l in enumerate(names):
            header.append({'name': l, 'type': types[i]})
    for d in data:
        pmid = d[4]
        link = '<a href="http://www.ncbi.nlm.nih.gov/pubmed?term=' + pmid + '" target="_blank">' + pmid + '</a>'
        d[4] = link
        
        ut = d[13]
        citations = d[14]
        

        # add wos link:
        # if ut != '':
            # wos_link = '<a href="'
            # wos_link += 'http://gateway.webofknowledge.com/gateway/Gateway.cgi?GWVersion=2&SrcApp=PARTNER_APP&SrcAuth=LinksAMR&KeyUT='
            
            # wos_link += ut.zfill(15)
            # wos_link += '&DestLinkType=FullRecord&DestApp=ALL_WOS&UsrCustomerID=3b43717f41be607aa14afe1bd1c6ec43" target="_blank">'
            # wos_link += str(citations).strip('.0') + '</a>'
        # else:
            # wos_link = str(citations).strip('.0')
        
        # dont add wos link:
        # wos_link = str(citations).strip('.0')
        wos_link = citations
        
        d[13] = wos_link
        d.pop(-1)
        
    citations_header = header.pop(-1)
    header[-1] = citations_header
        
    # embed()
    
    
    with open(out_file,'w') as file:
        json.dump({'header':header, 'data':data},file)
    
    return out_file

if __name__ == '__main__':
    if len(argv) < 2:
        raise Exception('Script needs a csv file')
    in_file = argv[1]
    dump_json(in_file)

def sort_categories():
    import csv, sys, re
    file_name_in = sys.argv[1]
    file = open(file_name_in, 'rU')
    x = []; header = []
    for i, row in enumerate(csv.reader(file)):
        if i<=0:
            header = row
        else:
            x.append(row)
    file.close()
    c = []
    for row in x:
        th = [a for i, a in enumerate(header) if row[i]!=""]
        c.append('"' + ", ".join(th) + '"')
    file_name_out = file_name_in.replace('.csv','_out.csv')
    with open(file_name_out, 'w') as out_file:
        for s in c:
            out_file.write("%s\n" % s)


