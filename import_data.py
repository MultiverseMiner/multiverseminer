#!/usr/bin/env python

# This item importer reviews the json file, then creates or updates each item.


from app import db
from app.models import *
import app
import json

#import our items
text=open('data/items.json').read()
jsonitems = json.loads(text)

categories={}

########################
# Process all JSON items
for itemid in jsonitems:
    # grab a single item in json format
    jsonitem=jsonitems[itemid]

    print "checking %s..." % jsonitem['id']

    #create an empty newitem which we may or may not use
    newitem = Item( id=itemid, name=jsonitem['name'])

    # Check to see if any pre-existing items in the db match the item ID
    dbitems= Item.query.filter_by(id=itemid)

    if dbitems.first():
        print "%s already exists in db, updating..." % itemid
        newitem=dbitems.first()


    # This is a summation of all the existing json fields that it could possibly have.
    fields=['accuracy','attack','attackSpeed','autoGather','autoMine','autoRefine','autoScavenge','defense','description ','droprate','evasion','experience','gearType','health','lootLuck','minimumMiningLevel','miningLuck','perception','planetLimit','regeneration','resilience','scavengeLuck','shipSpeed','storagelimit','strength','value ']


    # They are only set on the new item if they were in the json.
    for field in fields:
        if field in jsonitem:
            setattr(newitem, field, jsonitem[field])

    # For now we just need to make a list of unique categories
    if jsonitem['category']:
        # we can use the categories keys to ensure a unique list
        categories[jsonitem['category']]=1

    # This is as far as we can go with this new item. Commit it to the DB
    db.session.add(newitem)
    db.session.commit()

print "Item Import complete.... checking categories..."

########################
# Process all categories
for categoryname in categories:

    # check to see if the categoryname exists in the DB
    category= Category.query.filter_by(id=categoryname)
    if category.first():
        print "%s already exists... ignoring" % categoryname
    else:
        print "%s not found in DB... creating..." % categoryname
        category = Category( id=categoryname, name=categoryname)

        db.session.add(category)
        db.session.commit()

print "category creation complete; rechecking items to add ingredients and categories."

########################
# Process all items again
for itemid in jsonitems:
    # grab a single item in json format
    jsonitem=jsonitems[itemid]

    # grab the db item
    dbitem= Item.query.filter_by(id=itemid).first()

    # since autoproduce is self-referential, it needs to be done after the fact.
    if 'autoProduce' in jsonitem:
        dbitem.autoProduce= jsonitem['autoProduce']


    # grab the db category that matches the json
    dbcategory= Category.query.filter_by(id=jsonitem['category']).first()
    print "assigning category %s to %s" % (jsonitem['category'], itemid)
    dbitem.category=dbcategory

    # If there is a craft cost, process it.
    if 'craftCost' in jsonitem :
        print "craftCost for %s" % itemid
        for ingredientname in jsonitem['craftCost']:
            amount=jsonitem['craftCost'][ingredientname]

            print "requiring %s %s for %s" % (amount,ingredientname,itemid)
            dbingredient= Item.query.filter_by(id=ingredientname)

            if dbingredient.first():
                print "good news, %s was found in the db" % ingredientname
                dbingredient=dbingredient.first();

                if dbingredient in dbitem.ingredients:
                    print "%s already has %s listed" %()
                else:
                    print "%s requires %s %s to be added." % (itemid, amount, ingredientname)
                    dbrecipe=Ingredient(item=dbingredient,recipe=dbitem,  amount=amount)
                    db.session.add(dbrecipe)
            else:
                print "strange... %s was not in the db." % ingredientname

    db.session.add(dbitem)

db.session.commit()


print "category assignment complete"
