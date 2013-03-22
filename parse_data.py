import json
from IPython import embed
import pandas as pd



def modify_links(): # adds target=_blank to links so that they appear in a new window
    with open('data.json', 'r') as file:
        data = json.load(file)
        
    for d in data['data']:
        pmid = d[4]
        link = '<a href=\"http://www.ncbi.nlm.nih.gov/pubmed?term=' + pmid + '\" target=\"_blank\">' + pmid + '</a>'
        d[4] = link
        
    with open('datas.json', 'w') as file:
        json_file = json.dump(data, file)

    embed()


def merge_citations():
    xls_file = pd.ExcelFile('spreadsheet/finalList-organized.xlsx')
    papers = xls_file.parse('All', skiprows=1)
    # embed()
    
    with open('data.json', 'r') as file:
        data = json.load(file)
    embed()
    # test = pd.DataFrame
    # embed()
    
def add_citations():
    with open('data.json', 'r') as file:
        data = json.load(file)
    
    data['header'].append({u'name': u'Citations', u'type': u'string'})
    # embed()    
    for d in data['data']:
        d.append('citations')
        print d
        
    embed()
    
    
    
modify_links()
# merge_citations()
# add_citations()