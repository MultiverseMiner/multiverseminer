<?php

class BetaController extends BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{        
		return View::make('beta');

	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{

	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		// Fetch all request data.
		$data = Input::only('email', 'name');
		
		// Build the validation constraint set.
		$rules = array(
			'name' => array('alpha_num'),
			'email' => array('required', 'min:3', 'max:100', 'unique:betas'),
		);
		
		// Create a new validator instance.
		$validator = Validator::make($data, $rules);
		
		if ($validator->passes()) {

			$beta = new Beta();
			$beta->email = Input::get('email');
			$beta->name = Input::get('name');

			$beta->save();

			return Redirect::to('/')->with('global_success', 'true');
		}
		return Redirect::to('/')->withInput()->withErrors($validator)->with('message', 'Validation Errors!');
	}
	

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		//
	}


	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		//
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		//
	}


	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		//
	}


}
