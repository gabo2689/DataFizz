var fs = require("fs")
var globalPathData = "./data/";
var cheerio = require("cheerio");

//function for sort the Books
function quicksort(data) {
    if (data.length == 0) return [];

    var left = [], right = [], pivot = data[0];

    for (var i = 1; i < data.length; i++) {
        if(data[i].shipping_weight < pivot.shipping_weight)
            left.push(data[i])
        else
            right.push(data[i]);
    }

    return quicksort(left).concat(pivot, quicksort(right));
}

module.exports = {

    getBooks: function()
    {
        var booksList  = fs.readdirSync(globalPathData)
        return booksList
    },
    
    getBookData: function(obj)
    {
        var booksListCount = obj.length;
        var html;
        var $;

        var infoBook = {}
        var arrayBook=[]

        for(var i=0; i < booksListCount;i++){
            infoBook = {title: "",author:"",price:"",shipping_weight:"", isbn_10:null}
            html = null

            html = fs.readFileSync(globalPathData+obj[i]);

            $ = cheerio.load(html,{
                normalizeWhitespace: true,
                xmlMode: true,
                decodeEntities: true
            });

            var infoBuying = $('div [class=buying]').find('.parseasinTitle ').parent();

            var span = infoBuying.find('span').children();
            var a = span.find('a').children();

            $(span).each(function(i, elem) {

                if(elem.name === "a"){
                    if(infoBook.author===""){
                        infoBook.author=$(this).text();
                    }
                    else {
                        infoBook.author =  infoBook.author + "," + $(this).text();
                    }
                }
            });


            var data = $(infoBuying);

            infoBook.title = data.children().first().text().trim();

            $('span.bb_price').each(function(i,elem){
                infoBook.price = $(this).text().trim();
            })

            var table = $('table#productDetailsTable').find('div.content');
            var ul = table.find('ul').first().children();

            $(ul).each(function(i, elem) {
                var liValue = $(this).text();
                var _split = liValue.split(":")

                switch (_split[0]){
                    case "Shipping Weight":
                        var _spounds = _split[1].trim().split(" ")
                        infoBook.shipping_weight =  _spounds[0];
                        break;
                    case "ISBN-10":
                        infoBook.isbn_10 =  parseInt(_split[1].trim());
                        break;
                }
            });

            arrayBook.push(infoBook)

        }
        var sortBooks = quicksort(arrayBook);
        return sortBooks;

    },
    createBoxes:function(obj){

        var id = 1,totalWeight = 0;
        var contents=[];
        var limit = 10
        var i = 0
        var box = []

        while (i < obj.length) {
            var currentPounds = Number(obj[i].shipping_weight);
            totalWeight = totalWeight + currentPounds;
            if(totalWeight<=limit){
                obj[i].shipping_weight =  obj[i].shipping_weight + " pounds";
                obj[i].price =  obj[i].price + " USD";
                contents.push(obj[i])
                i++;
            }else {
                totalWeight = totalWeight - currentPounds;
                totalWeight = parseFloat(totalWeight).toFixed(2);
                box.push({"box":{"id":id, "totalWeight":totalWeight + " pounds", "contents":contents}})
                totalWeight = 0;
                contents = [];
                id++;
            }

        }
        return box;

    }
    
}