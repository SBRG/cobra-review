file = open('categories.csv', 'rU')
x = []; header = []
for i, row in enumerate(csv.reader(file)):
    if i<=1:
        header.append(row)
    else:
        if bool([a for a in row if a != ""]):
            x.append(row)
file.close()
