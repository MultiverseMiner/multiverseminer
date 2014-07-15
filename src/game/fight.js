function Fight(teamList) {
    this.teams = [];
    this.log = [];
    this.status = {
        turn: Math.round(Math.random()), //random starter. Opposite of this number starts
        active: true
    };

    $('#combat-log').html(' '); //clear log

    this.winner = -1;

    // ---------------------------------------------------------------------------
    // main functions
    // ---------------------------------------------------------------------------
    this.init = function () {
        var npc = new NPC((['policeMan', 'thug'])[Math.floor(Math.random() * 2)]);
        npc.initialize();
        this.teams = [
            new Team([game.player]),
            new Team([npc])
        ];
        this.teams[0].members[0].health
        //$('#playerHP').width((this.teams[0].members[0].health/this.teams[0].members[0].maxHealth)*100+"%");
        //$('#enemyHP').width((this.teams[1].members[0].health/this.teams[1].members[0].maxHealth)*100+"%");
        $('#combat-end-log')[0].innerHTML = ""; //clear it
        $('#combat-log')[0].classList.remove("hidden");
    };

    this.update = function () {};

    this.show = function () {};

    this.hide = function () {};

    this.disableFight = function () {
        this.teams[0].members[0].inCombat = false;
        this.teams[1].members[0].inCombat = false;
        this.status.active = false;
        $('#combat-end-log')[0].innerHTML = ""; //clear it
        $('#combat-log')[0].classList.remove("hidden");
    };

    // ---------------------------------------------------------------------------
    // fight functions
    // ---------------------------------------------------------------------------
    this.attack = function () {
        //placeholder. "Attack" button triggers this.
        if (this.status.active) {
            //very bad, will change
            this.action("attack", this.teams[0].members[0], this.teams[1].members[0]);
        }
    };
    this.heal = function () {
        if (this.status.active) {
            this.action("heal", this.teams[0].members[0], this.teams[0].members[0]);
        }
    };
    this.nextTurn = function () {
        this.checkStatus();
        if (!this.status.active) {
            //no combat
            this.teams[0].members[0].inCombat = false;
            this.teams[1].members[0].inCombat = false;
            return this;
        }
        this.status.turn = 1 - this.status.turn; //switch turn to other player
        this.teams[this.status.turn].requestMove(this, this.teams[1 - this.status.turn]);
    };

    this.action = function (action, source, target) {
        if (action == "attack") {
            var sourceStats = source.stats;
            var targetStats = target.stats;

            var damage = sourceStats.damage;
            var log = (source.opts.description || source.name) + (source.opts.attackText ? (source.opts.attackText + source.opts.weaponName) : (" hit " + target.opts.description.toLowerCase() || target.name)) + " for " + damage + " hp.";
            this.log.push(log);
            $('#combat-log').prepend(log + "<br>");
            target.takeDamage(this, damage);
        } else if (action == "heal") {
            var sourceStats = source.stats;
            var targetStats = target.stats;
            var damage = sourceStats.damage;
            var heal = sourceStats.damage;
            var log = (source.opts.description || source.name) + " heals " + (target.opts.description || target.name) + " for " + damage + " hp.";
            this.log.push(log);
            $('#combat-log').prepend(log + "<br>");
            target.heal(this, heal);
        }
        this.nextTurn();
    };

    this.checkStatus = function () {
        /*for(var team=0;team<this.teams.length;team++){
			for(var member=0;member<this.teams[team].members.length;member++){
				var combatant = this.teams[team].members[member];
				if(combatant.isAlive() === false){
					var log = "combatant "+combatant.name+" is dead";
					this.log.push(log);
					console.log(log);
					$('#combat-log').prepend(log+"<br>");
				}
			}
		}*/ //old method just in case

        if (this.teams[0].areAllDead()) { //your team dies, you lose
            //TODO: put this into a function
            $('#combat-log')[0].classList.add("hidden");
            var text = $('#combat-end-log')[0];
            text.innerHTML = "Battle Lost!<br>Wait 60 seconds to revive.";

            this.status.active = false; //disable fight when somebody dies
            this.winner = this.teams[1];

            onPlayerDied();


        } else if (this.teams[1].areAllDead()) { //enemy team dies, you win
            //TODO: put this into a function
            $('#combat-log')[0].classList.add("hidden");
            var lootTable = game.getLootTable(1500); //npcGenericLoot
            var items = game.loot(lootTable, this.teams[1].members.length); //for now, it'll loot once per enemy in the enemy team
            //TODO: make this loot depending on each enemy
            var lootedItems = [];
            for (var i = 0; i < items.length; i++) {
                if (!lootedItems[items[i]]) lootedItems[items[i]] = 0;
                lootedItems[items[i]]++;
            }
            this.teams[0].members[0].opts.player.storage.addItems(items);
            var text = $('#combat-end-log')[0];
            text.innerHTML = "Battle won!<br>You've earned " + this.teams[1].members[0].opts.xpGain + " xp.<br><br>Loot:";

            this.teams[0].members[0].gainExp(this.teams[1].members[0].opts.xpGain); //gainExp

            for (var k in lootedItems) {
                text.innerHTML += "<br>" + lootedItems[k] + " " + game.getItem(k).name; // # item ej: 3 Copper Bar
            }

            this.status.active = false; //disable fight when somebody dies
            this.winner = this.teams[0];
            
            game.questProgress('kill', "1 " + this.teams[1].members[0].opts.id);
            
        }

        $('#playerHP').width((this.teams[0].members[0].health / this.teams[0].members[0].maxHealth) * 100 + "%");
        $('#enemyHP').width((this.teams[1].members[0].health / this.teams[1].members[0].maxHealth) * 100 + "%");
    };

    // ---------------------------------------------------------------------------
    // loading / saving
    // ---------------------------------------------------------------------------
    //TODO: add save/load


    // ---------------------------------------------------------------------------
    // inner class
    // ---------------------------------------------------------------------------

    function Team(memberList) {
        this.members = [];
        for (var i = 0; i < memberList.length; i++) {
            memberList[i].combatant.inCombat = true;
            this.members.push(
                memberList[i].combatant
            );
        }
        this.requestMove = function (fight, opponent) {
            this.members[0].requestMove(fight, this, opponent);
        };
        this.getStatus = function () {
            //TODO: add more stats
            return {
                'alive': this.getAlive().length,
                'dead': this.getDead().length
            };
        };

        this.getRandomMember = function () {
            var alive = getAlive();
            return alive[Math.floor((Math.random() * alive.length * 3) % alive.length)]; //made it *3 to increase randomness
        };

        this.getAlive = function () {
            var alive = [];
            for (var i = 0; i < this.members.length; i++)
                if (this.members[i].isAlive())
                    alive.push(this.members[i]);
            return alive;
        };

        this.getDead = function () {
            var dead = [];
            for (var i = 0; i < this.members.length; i++)
                if (!this.members[i].isAlive())
                    dead.push(this.members[i]);
            return dead;
        };

        this.areAllDead = function () {
            return this.getDead().length == this.members.length;
        };
    }
}
