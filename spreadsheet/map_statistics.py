from collections import defaultdict
import sys, json, csv, urllib2, json, time
filename = sys.argv[1]                  # data.csv
file = open(filename, 'rU')
count = defaultdict(int); map_index = 0; first_index = 2
for row in csv.reader(file):
    map_index = row.index('Location')
    break
for i, row in enumerate(csv.reader(file)):
    if i < first_index:
        continue
    try:
        count[row[map_index]] += 1
    except IndexError:
        print 'no index at %d' % i
file.close()
# get latitudes and longitudes
lat = {}; lng = {}
for k in count.keys():
    time.sleep(0.5)
    response = urllib2.urlopen("http://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=false" % k.replace(' ', '+'))
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
for k, v in count.items():
    try:
        array.append([lat[k], lng[k], unicode(k, 'ISO-8859-1'), v])
    except KeyError:
        continue
with open(output_filename, 'w') as file:
    json.dump(array, file)
