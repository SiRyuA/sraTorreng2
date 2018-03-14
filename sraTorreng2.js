var http = require('http');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var parseString = require('xml2js').parseString;

var xmlurl = '';
var nyaa = 'https://nyaa.si/?page=rss';
var sukebei = 'https://sukebei.nyaa.si/?page=rss';
var tokyotosho = 'https://www.tokyotosho.info/rss.php?';
var leopard = "http://leopard-raws.org/rss.php?";
var horrible = "http://horriblesubs.info/rss.php?"; // all, 1080, 720, sd
var port = process.env.PORT || 4444;

http.createServer(function(req, res) {
  var link = req.url;
  var query = url.parse(link, true).query;

  if(req.method == 'POST') {
    req.on('data', function(get) {
      var data = querystring.parse(get.toString());
      query = data;
    })
  }

  if(query.s == 'nyaa' || query.s == 'sukebei' || query.s == 'tokyotosho' || query.s == 'leopard' || query.s == 'horrible') {
    if(query.s == 'nyaa' || query.s == 'sukebei') {
      if(query.s == 'nyaa') xmlurl = nyaa;
      else if(query.s == 'sukebei') xmlurl = sukebei;
      if(query.c) xmlurl += "&cats=" + query.c;
      if(query.i) xmlurl += "&term=" + query.i;
    }
    else if(query.s == 'tokyotosho') {
      xmlurl = tokyotosho;
      if(query.c) xmlurl += "filter=" + query.c;
      if(query.i) xmlurl += "&term=" + query.i;
    }
    else if(query.s == 'leopard') {
      xmlurl = leopard;
      if(query.i) xmlurl += "search=" + query.i;
    }
    else if(query.s == 'horrible') {
      xmlurl = horrible;
      if(query.c) xmlurl += "res=" + query.c;
    }

    request(xmlurl, function(error, response, html){
      if (error) {throw error};


      if(query.s == 'nyaa' || query.s == 'sukebei') {
        parseString(html, function(err, result) {
          var item = new Array;
          var time = new Date();

          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          for(var i=0;i<result.rss.channel[0].item.length;i++) {
            var data = {
              "title" : result.rss.channel[0].item[i]['title'][0],
              "torrent" : result.rss.channel[0].item[i]['link'][0],
              "pubDate" : result.rss.channel[0].item[i]['pubDate'][0],
              "seeders" : result.rss.channel[0].item[i]['nyaa:seeders'][0],
              "leechers" : result.rss.channel[0].item[i]['nyaa:leechers'][0],
              "downloads" : result.rss.channel[0].item[i]['nyaa:downloads'][0],
              "infoHash" : result.rss.channel[0].item[i]['nyaa:infoHash'][0],
              "categoryID" : result.rss.channel[0].item[i]['nyaa:categoryId'][0],
              "category" : result.rss.channel[0].item[i]['nyaa:category'][0],
              "size" : result.rss.channel[0].item[i]['nyaa:size'][0]
            };
            item.push(data);
          }
          item = JSON.stringify(item);
          if(query.s == 'nyaa') console.log("["+time+"] Get Nyaa");
          else console.log("["+time+"] Get Sukebei");
          res.end(item);
        });
      }

      else if(query.s == 'tokyotosho') {
        parseString(html, function(err, result) {
          var item = new Array;
          var time = new Date();

          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          for(var i=0;i<result.rss.channel[0].item.length;i++) {
            var desc = result.rss.channel[0].item[0]['description'][0].toString();
            desc = desc.replace('<![CDATA[', '');
            desc = desc.split("<br />");

            var torrent = desc[0];
            torrent = torrent.split('https://');
            torrent = torrent[1].split('.torrent');
            torrent = "https://" + torrent[0] + ".torrent";

            var magnet = desc[1];
            magnet = magnet.split('magnet:?');
            magnet = magnet[1].split('">Magnet');
            magnet = "magnet:?" + magnet[0];

            var size = desc[3];
            size = size.split('Size: ');
            size = size[1];

            var data = {
              "title" : result.rss.channel[0].item[i]['title'][0],
              "link" : result.rss.channel[0].item[i]['link'][0],
              "pubDate" : result.rss.channel[0].item[0]['pubDate'][0],
              "details" : result.rss.channel[0].item[0]['guid'][0],
              "torrent" : torrent,
              "magnet" : magnet,
              "size" : size
            }
            item.push(data);
          }
          item = JSON.stringify(item);
          console.log("["+time+"] Get Tokyotosho");
          res.end(item);
        });
      }

      else if(query.s == 'leopard') {
        parseString(html, function(err, result) {
          var item = new Array;
          var time = new Date();

          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

          for(var i=0;i<result.rss.channel[0].item.length;i++) {
            var data = {
              "title" : result.rss.channel[0].item[i]['title'][0],
              "torrent" : result.rss.channel[0].item[i]['link'][0],
              "pubDate" : result.rss.channel[0].item[i]['pubDate'][0]
            }
            item.push(data);
          }
          item = JSON.stringify(item);
          console.log("["+time+"] Get Leopard");
          res.end(item);
        });
      }

      else if(query.s == 'horrible') {
        parseString(html, function(err, result) {
          var item = new Array;
          var time = new Date();

          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

          for(var i=0;i<result.rss.channel[0].item.length;i++) {
            var data = {
              "title" : result.rss.channel[0].item[i]['title'][0],
              "magnet" : result.rss.channel[0].item[i]['link'][0],
              "pubDate" : result.rss.channel[0].item[i]['pubDate'][0]
            }
            item.push(data);
          }
          item = JSON.stringify(item);
          console.log("["+time+"] Get Horrible");
          res.end(item);
        });
      }


    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.write("Site Not Found.", "utf-8");
    res.end();
  }
}).listen(port);
