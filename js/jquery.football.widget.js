

var sportdb_widget_new = function( id, opts ) {
  // 'use strict';

  var _$el;
  var _$div1;   // used for rounds
  var _$div2;   // used for round details (matches/games)
  var _render_round;   // compiled underscore template - nb: it's just a js function
  var _render_rounds_long;
  var _render_rounds_short;
  var _api;

  var _defaults = {
                tplId: null
              };
  var _settings;


  function _debug( msg ) {
      if( window.console && window.console.log ) {
        window.console.log( '[debug] '+msg );
      }
    }

  var _def_tpl_rounds_long = "" +
"    <% _.each( data.rounds, function( round, index ) { %>" +
"" +
"      <%  if( index > 0 ) { %>" +
"        |" +
"      <% } %>" +
"" +
"      <a href='#' data-round='<%= round.pos %>'>" +
"        <%= round.title %>" +
"      </a>" +
"" +
"    <% }); %>" +
"";


  var _def_tpl_rounds_short = "" +
"    <% _.each( data.rounds, function( round, index ) { %>" +
"" +
"      <%  if( data.rounds.length/2 === index ) { %>" +
"         <br>" +
"      <% } else {" +
"            if( index > 0 ) { %>" +
"             |" +
"      <% }} %>" +
"" +
"      <a href='#' data-round='<%= round.pos %>'>" +
"        <%= round.pos %>" +
"      </a>" +
"" +
"    <% }); %>" +
"";

  var _def_tpl_round = "" +
"<h3>" +
" <%= data.event.title %>" +
"   -  " +
" <%= data.round.title %>" +
"</h3>" +
""  +
"<table>" +
" <% _.each( data.games, function( game, index ) { %>" +
"   <tr>" +
"     <td>" +
"      <%= game.play_at %>" +
"     </td>" +
"     <td style='text-align: right;'>" +
"       <%= game.team1_title %> (<%= game.team1_code %>)" +
"     </td>" +
"" +
"     <td>" +
"      <% if( game.score1 != null && game.score2 != null ) { %>" +
"        <% if( game.score1ot != null && game.score2ot != null ) { %>" +
"          <% if ( game.score1p != null && game.score2p != null ) { %>" +
"             <%= game.score1p %> - <%= game.score2p %> iE / " +
"          <% } %>" +
"           <%= game.score1ot %> - <%= game.score2ot %> nV / " +
"        <% } %>" +
"        <%= game.score1 %> - <%= game.score2 %>" +
"      <% } else { %>" +
"        - " +
"      <% } %>" +
"     </td>" +
"     <td>" +
"      <%= game.team2_title %> (<%= game.team2_code %>)" +
"     </td>" +
"   </tr>" +
"  <% }); %>" +
"</table>";
  
  
  
  function _init( id, opts )
  {
     if( typeof id === 'string' ) {
       _debug( 'sportdb_widget_new id: ' + id );
     }
     else
     {
       _debug( 'sportdb_widget_new w/ el' );
     }
    
     _settings = _.extend( {}, _defaults, opts );

     _debug( 'tplId: ' + _settings.tplId );
     _debug( 'apiPathPrefix: ' + _settings.apiPathPrefix );
    
     // pass along api opts if available
     var api_opts = {};
     if( _settings.apiPathPrefix !== undefined && _settings.apiPathPrefix !== null ) {
       api_opts.apiPathPrefix = _settings.apiPathPrefix;
     }
    
     _api = sportdb_api_new( api_opts );
    
     
     var tpl_str = '';

     if( _settings.tplId == null ) {
      // use builtin template
        tpl_str = _def_tpl_round;
     }
     else 
     { // use user specified/supplied template
       tpl_str = $( _settings.tplId ).html();
     }

     _render_round  = _.template( tpl_str );
     
     _render_rounds_short = _.template( _def_tpl_rounds_short );
     _render_rounds_long  = _.template( _def_tpl_rounds_long );


    _$el  = $( id );
    
    _$div1 = $( '<div />' );
    _$div2 = $( '<div />' );
    _$el.append(  _$div1, _$div2 );
    
    _update_rounds();

    _update_round( '1' );
  }


  function _update() { }

  function _update_rounds()
  {
    _debug( 'update rounds' );

    _api.fetch_rounds( _settings.event, function( json ) {
    
      var snippet;
      
      if( json.rounds.length >= 16 )
        snippet = _render_rounds_short( { data: json } );
      else
        snippet = _render_rounds_long( { data: json } );

      _$div1.html( snippet );

      // add click funs - assumes links with data-round='3' etc.
      // - todo/check: is there a better way to add click handlers in templates?
      _$div1.find( 'a' ).click( function() {
        _debug( 'click update round' );
        var $link = $(this);
        var round = $link.data( 'round' );
         _debug( 'data-round:' + round );
         _update_round( round );
         return false;
      });

    }); 
  }

  function _update_round( round_pos )
  {
    _debug( 'update round: ' + round_pos );

    _api.fetch_round( _settings.event, round_pos, function( json ) {
    
      var snippet = _render_round( { data: json } );
      _$div2.html( snippet );

    }); 
  }  // fn _update

  // call "c'tor/constructor"
  _init( id, opts );

  // return/export public api
  return {
     update: _update
  }
} // fn sportdb_widget_new




////////////////////
// wrapper for jquery plugin

function register_jquery_fn_football( $ ) {
   // 'use strict';

    function debug( msg ) {
      if( window.console && window.console.log ) {
        window.console.log( '[debug] '+msg );
      }
    }

    debug( 'before add jquery fn football' );

    function setup_sportdb_widget( el, opts ) {
      debug( 'hello from setup_sportdb_widget' );
      var sportdb_widget = sportdb_widget_new( el, opts );
      var $el = $(el);
      
      $el.data( 'widget', sportdb_widget );

      return el;
    }

    $.fn.football = function( opts ) {
        debug( 'calling football' );
        return this.each( function( index, el ) {
          debug( 'before setup_sportdb_widget['+ index +']' );
          setup_sportdb_widget( el, opts );
          debug( 'after setup_sportdb_widget['+ index +']' );
        });
    };

    debug( 'after add jquery fn football' );
}

register_jquery_fn_football( jQuery );