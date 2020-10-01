var exports = module.exports = {};
var request = require('request');
var fs = require('fs');
var parser = new require('xml2js').Parser();
var DEBUG_MODE = true;

exports.getTimeTable = function(user, password, options, callback){
  if(DEBUG_MODE){ console.log('warning! you are actually perfoming requests. extremely dangerous grounds, undocummented behaviour.')}
  if(user !== null && password !== null && callback !== null && options.format !== null && options.start !== null && options.end !== null){
    var req = {
      rawBody : '<?xml version="1.0" encoding="UTF-8"?><retrieveCalendar xmlns="http://campusm.gw.com/campusm"><username>'+user+'</username><password>'+password+'</password><calType>course_timetable</calType><start>'+options.start+'</start><end>'+options.end+'</end></retrieveCalendar>',
      url:'https://campusm.kcl.ac.uk//kclNewTimetable/services/CampusMUniversityService/retrieveCalendar'
    }
    request.post({
      url: req.url,
      body : req.rawBody,
      encoding: null,
      headers: {
        'Authorization': 'Basic YXBwbGljYXRpb25fc2VjX3VzZXI6ZjJnaDUzNDg=', //Still unsure about this?
        'Content-Type': 'application/xml',
        'Pragma': 'no-cache'
      }
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if(options.format == 'json'){
          parser.parseString(body, function (err, result) {
            if (err) throw err;
            callback(err, result);
          });
        }else{
          callback(null, body.toString('utf8'));
        }
      }else{
        if(response.statusCode==500)
        callback(new Error('500 ERROR :: Most likely wrong credentials.') , null);
      }
    });
  }
}
var isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};
var nullPointNoMore = function(thing){
  if(thing != null){
    return thing.toString();
  }else{
    return "";
  }
}
exports.parseTimeTableJson = function(json, callback){
  if(isObject(json)){
    tempParsing = { //Adressing only, this is good cause identifiers might change? This is all quite undocummented
      classes : json["ns1:retrieveCalendarResponse"]["ns1:calendar"][0]["ns1:calitem"]
    }
    for(var classObj in tempParsing.classes){
      tempParsing.classes[classObj] = {
        moduleName : nullPointNoMore(tempParsing.classes[classObj]["ns1:desc1"]),
        moduleDescription : nullPointNoMore(tempParsing.classes[classObj]["ns1:desc2"]),
        start : nullPointNoMore(tempParsing.classes[classObj]["ns1:start"]),
        end : nullPointNoMore(tempParsing.classes[classObj]["ns1:end"]),
        teacherName : nullPointNoMore(tempParsing.classes[classObj]["ns1:teacherName"]),
        locationID : nullPointNoMore(tempParsing.classes[classObj]["ns1:locCode"]),
        locationAddress : nullPointNoMore(tempParsing.classes[classObj]["ns1:locAdd1"])
      }
    }
    return callback(null, {
      classes : tempParsing.classes,
      root : json["$"]
    });
  }else{
    return callback(new Error('PARSE ERROR :: Null Object, cannot parse.'), null);
  }
}
