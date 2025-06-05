function one(call_two){
    console.log("step 1")
    call_two()
}
function two(){
    console.log("step 2")
}
one(two);  

