Multiverse Miner
====

This game is open source, however some of the art is not.

Please message antlong on irc.freenode.net for license details.

### Running

```shell
npm install # installs dependencies
npm start # compiles miner and opens a server (open in the browser)
```

---
Since unlocking the true potential of the elements, wormholes have been created and mastered, space travel occurs at the speed of light, and the elements in the universe can be manipulated at your whim.

Fascinated in the advancements in geology, physics, and time-travel, you decide to pick up your pickaxe, build yourself a ship and explore the farthest reaches of the universe.

* Mine resources, build a ship and explore the universe.
* Combine them, and craft powerful machines, armor, weapons and more; everything you need to survive must be created.
* Fight enemies; space pirates, thieves, aliens and more await to steal your treasures.
* Find artifacts, the most powerful and rare objects in the universe. Wield them to unlock powerful stat boosts. Only one of each artifact exists, will you be lucky enough to wield them?
* Travel to every planet in the solar system; Each contains accurate amounts of the real elements found on the planet.
* Scavenge the remains of war torn houses. Find rare items, and more.


[Join us on IRC.](http://webchat.freenode.net?channels=%23multiverseminer&uio=d4)  |  [Play the game.](http://multiverseminer.com)  |  [Visit our subreddit](http://reddit.com/r/multiverseminer)



Todo
==
Please update the list of items accordingly. Remove item when complete.

### Art
- Design new HUD, with an area to display badges, statistics on actions, HP, etc.
- Spaceship parts need icons.

## General UI
- Gather more statistics on actions performed and display them somewhere.
- New solution required for HUD. Remove this jqueryui shit.

## Solar System
- Should only be able to visit other planets once you've built the spaceship.
- Solar system modal should slide up from the bottom of the page.
- Tooltip when hovering over planet should display an icon of the planet, with the contents of the planets next to it. (what elements are found on the planet)
- Make asteroid field mineable.

## Questing
- Pull quests from assets/quests.json
- Show available and completed quests in a modal.

## Crafting
- Add option to tooltip to craft multiple via text input. Show the maximum you can make in the tooltip.
- Space travel to other planets besides the moon should require minimum level 2 upgrades on the ship.
- Refactor the Crafting window to use a grid like structure instead of the plain list
- Add element information to planet image overlay, eg what the planet contains.

## Gear
- update the gear ui to look a little better, inspiration from http://www.openorpg.com/wp-content/uploads/2014/05/charactertest.gif)
- Evaluate the stats properly for the equipped gear
- Fix equip best functionality, if we need it, otherwise remove it.
- add a stat display in the gear panel below the gear or if merged with the inventory as a side panel

## Inventory
- Move slot system into storage.js
- have storage.js fill in empty slots, no limit on slot count
- hook up the storage sort function to collapse the items into slots
- update the gear to re-use some of the inventory code
- show item informations in details when single clicking an item

## Planets
- add oxygen cost to planet data and update accordingly in update loop

## Combat
- Feed NPCs from xls to the combat system.
- Make stats on weapons and items work.
- Implement random chance of fight when flying between planets.
- Implement random chance of fight when scavenging.

## Other
- Right now we're relying on constructor functions that define Planet and Player keys and values when they're created using a lot of (this.object = etc), it would be nice if we could instead have Player and Planet defined with Player.prototype = {key: value,} instead for organization.
