from sys import argv
import json, csv

def dump_json(in_file):
    """ convert csv file to json array
    """
    out_file = in_file.replace('csv','json')
    x = []; header = []; names = []; types = []
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
                x.append(r)
        for i, l in enumerate(names):
            header.append({'name': l, 'type': types[i]})
    with open(out_file,'w') as file:
        json.dump({'header':header, 'data':x},file)
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
