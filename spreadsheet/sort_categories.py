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
