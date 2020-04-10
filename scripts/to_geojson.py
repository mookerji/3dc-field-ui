from geojson import Point, Feature, FeatureCollection

import click
import json
import pandas as pd


@click.command()
@click.argument('filename')
def main(filename):
    df = pd.read_csv(filename)
    records = []
    for i, row in df.iterrows():
        to_keep = ['vicinity','name','contact_name',
                   'contact_email', 'entity_type',
                   'created_at','status',]
        properties = row[to_keep].to_dict()
        records.append(Feature(geometry=Point((row.lng, row.lat)), properties=properties))
    print(json.dumps(FeatureCollection(records), sort_keys=True, indent=2))


if __name__ == '__main__':
    main()
