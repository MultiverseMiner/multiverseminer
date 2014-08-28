#!/usr/bin/env python

# This item importer reviews the json file, then creates or updates each item.


from mm import db
from mm.models import Item, Ingredient, Category, Planet, Player
import json



#######################################
#import our items
text=open('data/items.json').read()
jsonitems = json.loads(text)

categories={}

########################
# Process all JSON items
for itemid in jsonitems:
    # grab a single item in json format
    jsonitem=jsonitems[itemid]

    #print "checking %s..." % jsonitem['id']

    #create an empty newitem which we may or may not use
    newitem = Item( id=itemid, name=jsonitem['name'])

    # Check to see if any pre-existing items in the db match the item ID
    dbitems= Item.query.filter_by(id=itemid)

    if dbitems.first():
        print "%s already exists in db, updating..." % itemid
        newitem=dbitems.first()


    # This is a summation of all the existing json fields that it could possibly have.
    fields=['accuracy','attack','attack_speed','auto_gather','autoMine','auto_refiine','auto_scavenge','defense','description ','droprate','evasion','experience','gear_type','health','loot_luck','minimum_mining_level','mining_luck','perception','planet_limit','regeneration','resilience','scavenge_luck','ship_speed','storagelimit','strength','value ']


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
        """ """
        #print "%s already exists... ignoring" % categoryname
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
        #print "craftCost for %s" % itemid
        for ingredientname in jsonitem['craftCost']:
            amount=jsonitem['craftCost'][ingredientname]

            #print "requiring %s %s for %s" % (amount,ingredientname,itemid)
            dbingredient= Item.query.filter_by(id=ingredientname)

            if dbingredient.first():
                #print "good news, %s was found in the db" % ingredientname
                dbingredient=dbingredient.first();

                #print "checking for %s having %s " % (itemid, dbingredient.id)
                ingredients=Ingredient.query.filter_by(recipe_id=itemid, item_id=dbingredient.id)

                if  ingredients.first():
                    #print "%s already has %s listed" % ( dbitem.id, dbingredient.id)
                    dbrecipe=ingredients.first()
                    #update the amount, just in case
                    dbrecipe.amount=amount
                    db.session.add(dbrecipe)
                    db.session.commit()
                else:
                    print "%s requires %s %s to be added." % (itemid, amount, ingredientname)
                    dbrecipe=Ingredient(item=dbingredient,recipe=dbitem,  amount=amount)
                    db.session.add(dbrecipe)
                    db.session.commit()
            else:
                print "!!! strange... %s was not in the db." % ingredientname

    db.session.add(dbitem)

db.session.commit()

print "category assignment complete"



#######################################
#import our items
text=open('data/planets.json').read()
jsonplanets = json.loads(text)

########################
# Process all JSON items
for planetid in jsonplanets:
    planetjson=jsonplanets[planetid]

    #create an empty newitem which we may or may not use
    newplanet = Planet( id=planetid, name=planetjson['name'])

    # Check to see if any pre-existing items in the db match the item ID
    dbplanets= Planet.query.filter_by(id=planetid)

    if dbplanets.first():
        print "%s already exists in db, updating..." % planetid
        newplanet=dbplanets.first()
        # This is a summation of all the existing json fields that it could possibly have.

    fields=['mineable_max','mineable_remaining','mineable_replenish',
            'gatherable_max','gatherable_remaining','gatherable_replenish',
            'scavengable_max','scavengable_remaining','scavengable_replenish']

    # They are only set on the new item if they were in the json.
    for field in fields:
        if field in planetjson:
            setattr(newplanet, field, planetjson[field])


    # If there is a craft cost, process it.
    if 'loot' in planetjson :
        #print "craftCost for %s" % planetid
        for material in planetjson['loot']:

            #print "requiring %s %s for %s" % (amount,ingredientname,planetid)
            dbmaterial= Item.query.filter_by(id=material['item_id'])

            if dbmaterial.first():
                dbmaterial=dbmaterial.first();
                print "good news, %s was found in the db" % dbmaterial.name

                #print "checking for %s having %s " % (planetid, dbingredient.id)
                if dbmaterial in newplanet.items:
                    print "planet already has %s, moving on." % dbmaterial.name
                else:
                    print "%s wasn't found on planet, adding." % dbmaterial.name
                    print newplanet#items.append(dbmaterial)
                    db.session.add(dbmaterial)
                    db.session.commit()
            else:
                print "!!! strange... %s was not in the db." % material['item_id']



    # This is as far as we can go with this new item. Commit it to the DB
    db.session.add(newplanet)
    db.session.commit()
print "planets imported."


#######################################
#import our items
text=open('data/players.json').read()
jsonplayers = json.loads(text)

########################
# Process all JSON items
for playerid in jsonplayers:
    playerjson=jsonplayers[playerid]

    #create an empty newitem which we may or may not use
    newplayer = Player( oauth_id=playerjson['oauth_id'], username=playerjson['username'], email=playerjson['email'])

    # Check to see if any pre-existing items in the db match the item ID
    dbplayers= Player.query.filter_by(username=playerid)

    if dbplayers.first():
        print "%s already exists in db, updating..." % playerid
        newplayer=dbplayers.first()
        # This is a summation of all the existing json fields that it could possibly have.

    fields=[
            'created',
            'last_login',
            'access_level',
            'last_mine',
            'last_scavenge',
            'last_gather',
            'planet_id']



    # They are only set on the new item if they were in the json.
    for field in fields:
        if field in playerjson:
            setattr(newplayer, field, playerjson[field])

    # This is as far as we can go with this new item. Commit it to the DB
    db.session.add(newplayer)
    db.session.commit()
print "players imported."
