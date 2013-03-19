from sys import argv
import json, csv

def dump_json(in_file):
    """ convert csv file to json array
    """
    out_file = in_file.replace('csv','json')
    x = []; header = []; names = []; types = []
    with open(in_file, 'Ur') as file:
        for i, row in enumerate(csv.reader(file)):
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
