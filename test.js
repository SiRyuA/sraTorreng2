var http = require('http');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var btoa = require('btoa');
var parseString = require('xml2js').parseString;

var xmlurl = '';
var tfreeca = "http://www.tfreeca22.com/";
var tfreeca_download = "http://file.filetender.com/Execdownload.php?link=";
var port = process.env.PORT || 4444;

http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTION');
	res.setHeader('Access-Control-Allow-Headers', '*');

  var link = req.url;
  var query = url.parse(link, true).query;

  if(req.method == 'POST') {
    req.on('data', function(get) {
      var data = querystring.parse(get.toString());
      query = data;
    })
  }

  if(query.s == 'tfreeca') xmlurl = tfreeca + "board.php?&mode=list";
  if(query.c == "tmovie") xmlurl += "&b_id=" + query.c;
  if(query.c == "tdrama") xmlurl += "&b_id=" + query.c;
  if(query.c == "tent") xmlurl += "&b_id=" + query.c;
  if(query.c == "tv") xmlurl += "&b_id=" + query.c;
  if(query.c == "tani") xmlurl += "&b_id=" + query.c;
  if(query.c == "tmusic") xmlurl += "&b_id=" + query.c;
  if(query.c == "util") xmlurl += "&b_id=" + query.c;
  if(query.i) xmlurl += "&sc=" + query.i;

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

  request(xmlurl, function(error, response, html){
    if (error) {throw error};
    var $ = cheerio.load(html);
    var cnt = 1;
    var item = new Array;
    var time = new Date();

    $('table.b_list tr td.subject div.list_subject a').each(function() {
      var filter = RegExp('view', 'g');
      var check = $(this).attr('href');

      if(filter.test(check)) {
        var title = $(this).text();
        var href = $(this).attr('href');

        var idcode = href.split('&id=');
        idcode = idcode[1].split('&page=');
        idcode = idcode[0];

        var download_code = query.c + "|" + idcode + "|";
        var download_link = tfreeca_download + btoa(download_code);

        var cate = "";
        if(query.c == "tmovie") cate = "Movie";
        if(query.c == "tdrama") cate = "Drama";
        if(query.c == "tent") cate = "Entertainment";
        if(query.c == "tv") cate = "TV";
        if(query.c == "tani") cate = "Animation";
        if(query.c == "tmusic") cate = "Music";
        if(query.c == "util") cate = "Utility";

        var data = {
          "title" : title,
          "torrent" : download_link,
          "category" : cate
        };
        item.push(data);
      }
    });
    item = JSON.stringify(item);
    console.log("["+time+"] Get Tfreeca");
    res.end(item);
  });
}).listen(port);
