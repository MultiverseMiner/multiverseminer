<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBetaTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('betas', function($table)
			{
				$table->increments('id');
				$table->string('email');
				$table->string('name');
				$table->boolean('activated')->default(0);
				$table->string('activation_code')->nullable();
				$table->timestamp('activated_at')->nullable();
					
				$table->timestamps();

			});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('betas');
	}

}
