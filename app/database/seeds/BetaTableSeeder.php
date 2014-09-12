<?php

class BetaTableSeeder extends Seeder {

		public function run()
		{

			Beta::create(array('email' => 'foo@bar.com', 'name' => 'noname'));
		}

	}