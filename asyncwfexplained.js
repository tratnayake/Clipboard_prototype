var globalVar = "This is just here to show you that you don't need to wrap an async function and pass vars from the top";

function asyncwfExplained(startArg1){
	async.waterfall([
		//The first function always starts with a callback object
		function(callback){
			someAsyncFunction(startArg1,function(err,data){
				var f1result = data;
				//the first param is null (because we're saying that no errors were produced)
				//the second param is whatever data you want to pass forward (e.g so if you want)
				//something @ the very end, you have to keep PASSING till the end
				callback(null,f1result);

				})//END async function brackets
			console.log("THIS WILL NEVER HAPPEN BECAUSE ^ IS ASYNC + CALLBACK");
			}, // <-- This comma = very important
			//again
			function(f1result,callback){
					secondAsyncFunction(globalVar,function(err,data){
						var f2result = data;
						callback(null,f1result,f2result);
					}) // END async function brackets
				}	
			
				
		], //<-- When you're ready to finish. Before calling last function, remb this comma
		//THIS IS THE LAST FUNCTION
		function(err,f1result,f2result){
			if(err) return console.log(err);
			//now you can do something with the data you've gotten from async
			console.log(f1result + f2result);
		}
	)	
}