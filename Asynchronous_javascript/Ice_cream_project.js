let stocks ={
    fruits:[ "strawberry", "grapes", "banana"],
    liquid :["water", "ice"],
    holder :["cone","cup","stick"],
    toppings:["chocolate","sprinkles"]
}
let order = (Fruit_name,call_production)=>{
    setTimeout(()=>{
        call_production()
        console.log(`${stocks.fruits[Fruit_name]} was selected `)
    },2000)

}
let production = ()=>{
    setTimeout(()=>{
        console.log("Production has started")
        setTimeout(()=>{
            console.log("The fruit has been chopped")
            setTimeout(()=>{
                console.log(``)
            },1000)
        },2000)
    }, 0o000)
}
order(0,production)