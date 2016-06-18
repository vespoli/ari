//bower components
// = include ../bower_components/foo/foo.js.js 


//application
// mustache-like syntax for underscore templates
// default looks like <% myproperty %> which I dislike
// template variables now look like {{= myproperty }}
_.templateSettings = {
  evaluate :    /\{\{(.+?)\}\}/g,
  interpolate : /\{\{=(.+?)\}\}/g
};

// Major "concepts" to understand for creating dynamic html from appropriate webservice
// 1. ARI.DataService - create the appropriate data service methods
// 2. ARI.templates - create the appropriate html string with dynamic variables
// 3. ARI.create - apply modified markup and attach any listeners that are needed
// 4. activate your component. You can do it right away in document ready, or you can do it based on some event

var ARI = window.ARI || {};

/*******************************************************************************
* Global data service utility "class"
*******************************************************************************/
ARI.DataService = function(){
  var user = {
    //pass in params, provide a callback, provide any error handling
    //{o : 'userid'}
    getAll : function(opts, callback, errorConfig){
      var config = {
        url: '/rest/v1/users',
        data: opts
      }
      return processRequest(config, callback, errorConfig);
    },
    setDetails : function(opts, callback, errorConfig){
      var config = {
        type: 'POST',
        url: '/rest/v1/users',
        data: opts
      };
      return processRequest(config, callback, errorConfig);
    },
    //{username: 'fredmcgee'}
    getDetails : function(opts, callback, errorConfig){
      var config = {
        url: '/rest/v1/users/' + opts.username
      };
      return processRequest(config, callback, errorConfig);
    }
    //... other API methods related to a user
  }, //end user

  album = {
    remove : function(opts, callback, errorConfig){
      var config = {
        type: 'DELETE',
        url: '/rest/v1/albums/' + opts.album,
        data: opts
      };
      return processRequest(config, callback, errorConfig);
    },
    removeTrack : function(opts, callback, errorConfig){
      var config = {
        type: 'DELETE',
        url: '/rest/v1/albums/' + opts.album + '/' + opts.track,
        data: opts
      };
      return processRequest(config, callback, errorConfig);
    }

    //... other API methods related to an album
  }, //end album

  chips = {

  },

  track = {
    getTracks : function(opts, callback, errorConfig){
      var config = {
        url: '/data/tracks.json',
        data: opts
      };
      return processRequest(config, callback, errorConfig);
    }
  },

  video = {

  },

  profile = {

  },

  roles = {

  },

  blog = {

  },
  
  //generic ajax method. (overrides defaults, callback function, custom error handling object)
  processRequest = function(config, callback, errorConfig){
    var defaults = {
      type: 'GET',
      contentType: "application/json; charset=utf-8",
      dataType: 'json'
    };

    //override defaults as needed
    var settings = $.extend({},defaults,config);

    $.ajax(settings).done(function(data){
      if(typeof callback === 'function') {callback(data);}
      return true;
    }).fail(function(xhr, textStatus, errorThrown) {
      errorHandler(xhr, textStatus, errorThrown, errorConfig);
      return false;
    });
  };

  errorHandler = function(xhr, textStatus, errorThrown, errorConfig){
    //pass in custom handlers for errors example
    // errorConfig=[
      //{status : 0, action: function(){console.log('here is my error handler code');}},
      //{status : 302, action: function(){console.log('here is my other error handler code');}}
    //];
    console.log("Unable to process request :: " + JSON.stringify(xhr) + ' Status :: ' + textStatus + ' Error thrown :: ' + errorThrown);

    if(errorConfig){
      var customError = false;
      $.each(errorConfig, function(i){
        //console.log(this.status + ' and ' + xhr.status);
        if(this.status === xhr.status && typeof this.action === 'function'){
          this.action(xhr);
          customError = true;
        }
      });
      if(customError){return;}
    }

    // generic handler
    if (xhr.status === 401) {
      //window.location = '/auth/'; //?ourl='+document.URL;
    } else if (xhr.status === 403) {
      console.log("Requested object not found!");
    } else if (xhr.status === 404) {
      console.log("Requested service not found!");
    } else if (xhr.status === 405) {
      console.log('Method not allowed');
    } else if (xhr.status === 420) {
      console.log("Unable to process request. " + JSON.stringify(xhr));
    } else if (xhr.status === 500) {
      console.log('server error');
    } else {
      console.log("Failed dataService request! " + errorThrown + " :: " + textStatus);
    }
    console.log("Failed request");
  };
  return {
    user: user,
    album: album,
    track: track,
    video: video,
    profile: profile,
    roles: roles,
    blog: blog
  };
}; //DataService


//Our markup templates
//https://lodash.com/docs#template
//using mustache syntax via config above
ARI.templates = {
  trackListing          :  _.template('<li class="fade-in" data-name="{{=name}}">Song: {{=name}} - Artist: {{=artistName}}</li>'),
  someOtherTemplate     :  _.template('<bar></bar>')
};


//this is our machine to create new chunks of markup
//typically you will pass a data object, the element where you want to stick it, and optionally some callback to happen after the fact
ARI.create = {
  trackListing : function(tracks, $ele, callback){
    var strTrackMarkup = '', str;
    _.each(tracks, function(track){ 
      strTrackMarkup += ARI.templates.trackListing(track); 
    });

    //apply our newly generated markup    
    $ele.html(strTrackMarkup); 

    //apply any listener logic to newly rendered markup
    $ele.find('li').click(function(){
      var $this = $(this);
      var data = {
        name : $this.data('name')
      };
      ARI.utilities.playsong(data);
    });

    //if a callback is passed, do it now
    if(typeof callback === 'function') {callback();}
  },
  //begin your other creation methods
  someOtherThing : function(eles, $ele, callback){

  }
};


ARI.utilities = {
  playsong : function(data){
    console.log('playing ' + data.name);
  }
};

/*******************************************************************************
* Begin throwaway example code
*******************************************************************************/

(function($){
  $('#fillTracks').on('click',function(e){
    e.preventDefault();
    //create an instance of our datasource "class"
    var ds = new ARI.DataService();
    //use the gretracks service
    //first arg is options to be used in the request, params etc
    //second arg is the success callback of the webservice
    //optional third arg is how to deal with errors. (see the errorConfig method on DataService for method signature and more info
    ds.track.getTracks({},function(data){
      //pass this to our "rendering" machine
      ARI.create.trackListing(data, $('#trackList'), function(){
        console.log('all done')
      });
    });

  });
})(jQuery);




// (function($,undefined){
//   '$:nomunge'; // Used by YUI compressor.
  
//   $.fn.serializeObject = function(){
//     var obj = {};
    
//     $.each( this.serializeArray(), function(i,o){
//       var n = o.name,
//         v = o.value;
        
//         obj[n] = obj[n] === undefined ? v
//           : $.isArray( obj[n] ) ? obj[n].concat( v )
//           : [ obj[n], v ];
//     });
    
//     return obj;
//   };
  
// })(jQuery);
















