//
// JavaScript Event Calendar
//
// Version: 2.0d
// Date: January 20, 2010
// For information: http://calendar.ilsen.net or kevin@ilsen.net
//
(function() {

  // Utility to get a DOM element
  var _Dom = {
    get: function(el) {
      if (typeof el == 'string') {
        return document.getElementById(el);
      } else {
        return el;
      }
    }
  };

  // Utility to add an Event handler
  var _Event = {
    add: function() {
      if (window.addEventListener) {
        return function(el, type, fn) {
          _Dom.get(el).addEventListener(type, fn, false);
        };
      } else if (window.attachEvent) {
        return function(el, type, fn) {
          var f = function() {
            fn.call(_Dom.get(el), window.event);
          };
          _Dom.get(el).attachEvent('on' + type, f);
        };
      }
    }()
  };

/*  
  TEST = function(container, message) {
    var _container;
    var _message = message;    
    _Event.add(window, 'load', function() {
      _container = _Dom.get(container);
    });    
    var _display = function() {
      var now = new Date();
      var time = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
      var msg = document.createElement('div');
      msg.innerHTML = _message + ' / ' + time + ' / ';
      var link = document.createElement('a');
      link.innerHTML = 'Redisplay';
      link.setAttribute('href', 'javascript:;');
      _Event.add(link, 'click', function () {
        _show();        
      });
      if (_container.hasChildNodes()) {
        while (_container.childNodes.length >= 1) {
          _container.removeChild(_container.firstChild);       
        } 
      }
      _container.appendChild(msg);
      _container.appendChild(link);
    };
    var _show = function() {
      if (_container) {
        _display();
      } else {
        _Event.add(window, 'load', function() {
          _display();
        });            
      }
    };
    return {
      show: _show
    };
  };
*/
  
  // Utility function that fixes a Netscape 2 and 3 bug
  var _getFullYear = function(d) { // d is a date object
    var yr = d.getYear();
    if (yr < 1000)
      yr += 1900;
    return yr;
  };

  // Various internal utility functions for date manipulation
  var _numDaysIn = function(mo,yr) {
    if (mo==4 || mo==6 || mo==9 || mo==11) return 30;
    else if ((mo==2) && _leapYear(yr)) return 29;
    else if (mo==2) return 28;
    else return 31;
  };
  var _leapYear = function(yr) {
    if (((yr % 4 == 0) && yr % 100 != 0) || yr % 400 == 0) return true;
    else return false;
  };
  var _prevMonth = function(mth) {
    if (mth == 1) return 12;
    else return (mth-1);
  };
  var _nextMonth = function(mth) {
    if (mth == 12) return 1;
    else return (mth+1);
  };
  var _prevYearMonth = function(yrmth) {
    if ((yrmth % 100) == 1) return ((yrmth-100)+11);
    else return (yrmth-1);
  };
  var _nextYearMonth = function(yrmth) {
    if ((yrmth % 100) == 12) return ((yrmth-11)+100);
    else return (yrmth+1);
  };

  // The calendar "class"
  JEC = function(container, options) {

    var _container;
    _Event.add(window, 'load', function() {
      _container = _Dom.get(container);
    });    
    options = options || {};    
    
    // The CSS class for the calendar table
    var _tableClass = options.tableClass || 'JEC';
    // 1=Sunday, 2=Monday, . . . 7=Saturday; 0=none
    var _specialDay = (options.specialDay == 0 ? 0 : options.specialDay ? options.specialDay : 1); 
    // The arrays of month names and weekday names (these can be overridden before displaying the calendar)
    var _months = options.months || [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
    var _weekdays = options.weekdays || [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
  
    //console.log('create calendar for ' + container + ', ' + _tableClass);

    // Initialize the range of the calendar to Jan - Dec of the current year.  Defined events will change this
    // as needed; it is also possible to explicitly override the range before showing the calendar.
  
    var _today = new Date();
    var _firstMonth = _getFullYear(_today) * 100 + 1;
    var _lastMonth = _firstMonth + 11;
  
    // events[] is a 'sparse' array -- aka a JavScript associative array; each element's index is a numeric date (YYYYMMDD)
    // and the value is an HTML element containing the ALL of the formatted events/images/links or that date
    var _events = [];  
    //console.log('created _events');
    
    // Private function used by _buildMonth() to build the table cell for a single date
    var _buildDate = function(yr, mo, dy, dayofweek, currentyear, currentmonth, currentday) {
      var elTd = document.createElement('td');
      var classes = '';
      if (dayofweek == _specialDay) classes += ' daySpecial';
      if ((yr == currentyear) && (mo == currentmonth) && (dy == currentday)) classes += ' dayToday';
      var elP = document.createElement('p');
      elP.innerHTML = dy;
      elTd.appendChild(elP);    
      var ind = (((yr * 100) + mo) * 100) + dy;
      if (_events[ind]) {
        classes += ' dayHasEvent';
        elTd.appendChild(_events[ind]);
      }
      elTd.setAttribute('class', classes);
      return elTd;
    };

    // Private function that builds the calendar for a particular year/month.
    var _buildMonth = function(yearmonth) {
      var curdy, curmo, curyr, yr, mo, dy, dayofweek, bgn, lastday;

      // Get the year and month
      if (typeof yearmonth == 'string') yearmonth = parseInt(yearmonth);
      mo = yearmonth % 100;
      yr = (yearmonth - mo) / 100;
  
      // Save current day, month, and year for comparison
      curdy = _today.getDate();
      curmo = _today.getMonth()+1;
      curyr = _getFullYear(_today);
      
      // Constrain to the range of months with events
      if (yearmonth < _firstMonth) {
        mo = _firstMonth % 100;
        yr = (_firstMonth - mo) / 100;
        yearmonth = _firstMonth;
      }
      if (yearmonth > _lastMonth) {
        mo = _lastMonth % 100;
        yr = (_lastMonth - mo) / 100;
        yearmonth = _lastMonth;
      }
  
      // Create a date object for the first day of the desired month
      bgn = new Date(_months[mo-1] + ' 1,' + yr);
      
      // Get the day-of-week of the first day, and the # days in the month
      dayofweek = bgn.getDay();
      lastday = _numDaysIn(mo,yr);
      
      // Build the calendar as an HTML table
      
      // The table head contains the month/year label
      var elThead = document.createElement('thead');
      var elTr = document.createElement('tr');
      var elTh = document.createElement('th');
      elTh.setAttribute('colspan', 7);
      elTh.innerHTML = _months[mo-1] + '&nbsp;' + yr;
      elTr.appendChild(elTh);
      elThead.appendChild(elTr);
  
      // The table body contains the week day names, and the days and events
      var elTbody = document.createElement('tbody');
      elTr = document.createElement('tr');
      for (var i=0;i<7;i++){
        elTh = document.createElement('th');
        elTh.innerHTML = _weekdays[i];
        elTr.appendChild(elTh);
      }
      elTbody.appendChild(elTr);
      elTr = document.createElement('tr');
      var elTd = document.createElement('td');
      dy = 1;
      // Special handling for the first week of the month
      for (var i=1;i<=7;i++) {
        if (i > dayofweek) {
          elTd = _buildDate(yr,mo,dy,i,curyr,curmo,curdy);
          dy++;
        } else {
          elTd = document.createElement('td');
          elTd.setAttribute('class', 'dayBlank');
        }
        elTr.appendChild(elTd);
      }
      elTbody.appendChild(elTr);
      // Rest of the weeks . . .
      while (dy <= lastday) {
        elTr = document.createElement('tr');
        for (var i=1;i<=7;i++) {
          if (dy <= lastday) {
            elTd = _buildDate(yr,mo,dy,i,curyr,curmo,curdy);
            dy++;
          } else {
            elTd = document.createElement('td');
            elTd.setAttribute('class', 'dayBlank');
          }
          elTr.appendChild(elTd);
        }
        elTbody.appendChild(elTr);
      }
  
      // The table foot contains the links to other months
      var elTfoot = document.createElement('tfoot');
      elTr = document.createElement('tr');
      elTh = document.createElement('th');
      elTh.setAttribute('colspan', 7);      
      if (yearmonth > _firstMonth) {
        var elA = document.createElement('a');
        elA.setAttribute('href', 'javascript:;');
        _Event.add(elA, 'click', function() {
          _showCalendar(_prevMonth(yearmonth));
        });
        elA.innerHTML = '&lt;-- View&nbsp;' + _months[_prevMonth(mo)-1];
        elTh.appendChild(elA);
      }
      if ((yearmonth > _firstMonth) && (yearmonth < _lastMonth)) {
        var elSpan = document.createElement('span');
        elSpan.innerHTML = '&nbsp;|&nbsp;';
        elTh.appendChild(elSpan);
      }
      if (yearmonth < _lastMonth) {
        var elA = document.createElement('a');
        elA.setAttribute('href', 'javascript:;');
        _Event.add(elA, 'click', function() {
          _showCalendar(_nextMonth(yearmonth));
        });
        elA.innerHTML = 'View&nbsp;' + _months[_nextMonth(mo)-1] + ' --&gt;';
        elTh.appendChild(elA);
      }
      elTr.appendChild(elTh);
      elTfoot.appendChild(elTr);
      elTr = document.createElement('tr');
      elTh = document.createElement('th');
      elTh.setAttribute('colspan', 7);
      var elSpan = document.createElement('span');
      elSpan.innerHTML = 'Jump to month:&nbsp;&nbsp;';
      elTh.appendChild(elSpan);
      var elSelect = document.createElement('select');
      elSelect.setAttribute('size', 1);
      _Event.add(elSelect, 'change', function() {
        _showCalendar(this.options[this.selectedIndex].value);
      });
      for (var ym = _firstMonth; ym <= _lastMonth; ym = _nextYearMonth(ym)) {
        var selMo = ym % 100;
        var selYr = (ym - selMo) / 100;
        var elOption = document.createElement('option');
        elOption.setAttribute('value', ym);
        if (ym == yearmonth) elOption.setAttribute('selected', 'selected');
        elOption.innerHTML = _months[selMo-1] + ' ' + selYr;
        elSelect.appendChild(elOption);
      }
      elTh.appendChild(elSelect);
      elTr.appendChild(elTh);
      elTfoot.appendChild(elTr);
      
      // Put it all together into a table
      var elTable = document.createElement('table');
      elTable.setAttribute('class', _tableClass);
      elTable.appendChild(elThead);
      elTable.appendChild(elTbody);
      elTable.appendChild(elTfoot);

      return elTable;
    };

    // This function builds and displays the calendar. It takes a year/month as its argument (YYYYMM).
    // It must be "exposed" because it is invoked when the user clicks a link to change months.
    var _showCalendar = function(yearmonth) {
      //console.log('_show: ' + container + ', ' + _tableClass);

      if (!yearmonth) {
        var curmo = _today.getMonth() + 1;
  
        // Default to current month and year
        var mo = curmo;
        var yr = _getFullYear(_today);
        yearmonth = (yr * 100) + mo;
      }

      var elTable = _buildMonth(yearmonth);

      // Display the calendar
      if (_container) {
        _displayCalendar(elTable);
      } else {
        // Make sure the page has finished loading, before displaying the calendar
        _Event.add(window, 'load', function() {
          //console.log('fired: showing ' + container + ', ' + _tableClass);
          _displayCalendar(elTable);
        });
      }
    };

    var _displayCalendar = function(elTable) {
      // Empty the container of any previous contents (e.g., previous calendar month)
      if (_container.hasChildNodes()) {
        while (_container.childNodes.length >= 1) {
          _container.removeChild(_container.firstChild);       
        } 
      }
      _container.appendChild(elTable);
    };
    
    // Each event is defined by calling the .defineEvent( ) method with the following parameters:
    //
    //   defineEvent(EventDate, EventDescription, EventLink, Image, Width, Height)
    //        EventDate is a numeric value in the format YYYYMMDD
    //        EvenDescription is a string that can include embedded HTML tags (e.g., <BR>, <strong>, etc.)
    //        EventLink is the URL of the target page if a hyperlink is desired from this event entry
    //        Image is the URL of the image if you want to display an image with this event
    //        Width is the width of the image in pixels
    //        Height is the height of the image in pixels
    //
    // (This method is basically the same as the DefineEvent() function from the original JEC implementation.)
    
    var _defineEvent = function(eventDate, eventDescription, eventLink, image, width, height) {
      // Build the HTML elements for this event: image (optional), link (optional), and description
      // If an event already exists for this date, append the new event to it.
      var elEventBlock = document.createElement('div');
      if (_events[eventDate]) {
        elEventBlock = _events[eventDate];
        elEventBlock.appendChild(document.createElement('br'));
      }
      
      if (image && image != '') {
        var elImg = document.createElement('img');
        elImg.setAttribute('src', image);
        if (width && height) {
          elImg.setAttribute('width', width);
          elImg.setAttribute('height', height);
        }
        elEventBlock.appendChild(elImg);
      }
      if (eventLink && eventLink != '') {
        var elA = document.createElement('a');
        elA.setAttribute('href', eventLink);
        elA.innerHTML = eventDescription;
        elEventBlock.appendChild(elA);
      } else {
        var elSpan = document.createElement('span');
        elSpan.innerHTML = eventDescription;
        elEventBlock.appendChild(elSpan);
      }
      _events[eventDate] = elEventBlock; 
      // Adjust the minimum and maximum month & year to include this date
      var tmp = Math.floor(eventDate / 100);
      if (tmp < _firstMonth) _firstMonth = tmp;
      if (tmp > _lastMonth) _lastMonth = tmp;
    };

    // The public "methods" of the JEC "class" permit events to be defined, settings to be overridden,
    // and of course the initial calendar to be shown.
    return {
      
      // Each event is defined by calling the .defineEvent( ) method with the following parameters:
      //
      //   defineEvent(EventDate, EventDescription, EventLink, Image, Width, Height)
      //        EventDate is a numeric value in the format YYYYMMDD
      //        EvenDescription is a string that can include embedded HTML tags (e.g., <BR>, <strong>, etc.)
      //        EventLink is the URL of the target page if a hyperlink is desired from this event entry
      //        Image is the URL of the image if you want to display an image with this event
      //        Width is the width of the image in pixels
      //        Height is the height of the image in pixels
      //
      // (This method is basically the same as the DefineEvent() function from the original JEC implementation.)
      defineEvent: _defineEvent,
      
      // Multiple events may be defined using the defineEvents( ) method. Pass an array of objects; each
      // object can specify the following properties:
      //   eventDate
      //   eventDescription
      //   eventLink
      //   image
      //   imageWidth
      //   imageHeight
      defineEvents: null,
      
      // Show the calendar in its container by calling the showCalendar( ) method. Pass a year and month
      // (as an integer, e.g. 201007 for July, 2007) or pass no argument to show the current month.
      showCalendar: _showCalendar
  };
  
};

})();