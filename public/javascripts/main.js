
$(function(){
 $('#search').on('keyup', function(e){
   if(e.keyCode === 13) {
     var parameters = { search: $(this).val()};
       $.get( '/searching',parameters, function(data) {
       	//$('#test').html(data);
        $('#results').html(data);
     });
    };
 });
});


/*
function myFunction(){
	console.log("hello");

	var parameters = { search: $(this).val() };
	//console.log(parameters.search);
    //$.get( '/searching',parameters, function(data) {
   	//	$('#results').html(data);
    //});

}
*/