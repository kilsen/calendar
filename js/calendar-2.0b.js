//
// JavaScript Event Calendar
//
// Version: 2.0b
// Date: January 20, 2010
// For information: http:/calendar.ilsen.net  or kevin@ilsen.net
//
var JEC = function(container) {
  
  // Configurable values are set to defaults here; can override them before calling Calendar( ) from the HTML page

  var _specialDay = 1; // 1=Sunday, 2=Monday, . . . 7=Saturday
  var _fontSize = 5;
  var _colorBackground = "#ffffcc";
  var _colorSpecialDay = "red";
  var _colorToday = "green";
  var _colorEvent = "blue";

  var _calendarContainer = 'xx';

  // Utility class for DOM
  var _Dom = {
      get: function(el) {
        if (typeof el == 'string') {
          return document.getElementById(el);
        } else {
          return el;
        }
      },
      empty: function(el) {
        var el = this.get(el);
        if (el.hasChildNodes()) {
          while (el.childNodes.length >= 1) {
            el.removeChild(cell.firstChild);       
          } 
        }
      }
  };
      
  
  // Utility class for Events
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
  // Add an event: when DOM is ready, get the container element (by id)
  _Event.add(window, 'load', function() {
    _calendarContainer = _Dom.get(container);
  });

  // Utility function that fixes a Netscape 2 and 3 bug
  var _getFullYear = function(d) { // d is a date object
    var yr = d.getYear();
    if (yr < 1000)
      yr += 1900;
    return yr;
  };

  // Initialize the range of the calendar to Jan - Dec of the current year.  Defined events will change this
  // as needed; it is also possible to explicitly override the range before showing the calendar.

  var _today = new Date();
  var _firstMonth = _getFullYear(_today) * 100 + 1;
  var _lastMonth = _firstMonth + 11;

  // events[] is a SPARSE array
  var _events = new Array;  

  // Utility function to populate an array with values
  var _arr = function() {
    for (var n=0;n<arguments.length;n++) {
      this[n+1] = arguments[n];
    }
  };
  
  // Create the array of month names (used in various places)
  var _months = new _arr("January","February","March","April","May","June","July","August","September","October","November","December");

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

  _jumpTo = function(calendar, thispage) {
    var sel, yrmo;

    sel = calendar.selectedIndex;
    yrmo = calendar.form.jumpmonth[sel].value;
    document.location = thispage + "?" + yrmo;
  };

  var _buildSelectionList = function(current,thispage) {
    var mo, yr, yearmonth;

    yearmonth = _firstMonth;
    var elSelect = document.createElement('select');
    elSelect.setAttribute('size', 1);
    elSelect.setAttribute('onchange', '_jumpTo(this, \'' + thispage + '\'value);');
    while (yearmonth <= _lastMonth) {
      mo = yearmonth % 100;
      yr = (yearmonth - mo) / 100;
      var elOption = document.createElement('option');
      elOption.setAttribute('value', yearmonth);
      if (yearmonth == current) elOption.setAttribute('selected', 'selected');
      elOption.innerHTML = _months[mo] + ' ' + yr;
      elSelect.appendChild(elOption);
      yearmonth = _nextYearMonth(yearmonth);
    }
    return elSelect;
  };

  var _buildDate = function(yr, mo, dy, dayofweek, currentmonth, currentday) {
    var elTd = document.createElement('td');
    elTd.setAttribute('align', 'center');
    elTd.setAttribute('valign', 'top');
    var elP = document.createElement('p');
    elP.innerHTML = dy;
    elTd.appendChild(elP);    
    var ind = (((yr * 100) + mo) * 100) + dy;
    if (_events[ind])
      elTd.appendChild(_events[ind]);
    return elTd;
  };

  return {
    
    // Each event is defined by calling the defineEvent( ) routine with the following parameters:
    //
    //   defineEvent(EventDate, EventDescription, EventLink, Image, Width, Height)
    //        EventDate is a numeric value in the format YYYYMMDD
    //        EvenDescription is a string that can include embedded HTML tags (e.g., <BR>, <strong>, etc.)
    //        EventLink is the URL of the target page if a hyperlink is desired from this event entry
    //        Image is the URL of the image if you want to display an image with this event
    //        Width is the width of the image in pixels
    //        Height is the height of the image in pixels
    
    defineEvent: function(eventDate, eventDescription, eventLink, image, width, height) {
    	// Build the HTML elements for this event: image (optional), link (optional), and description
      // If an event already exists for this date, append the new event to it.
      var elEventBlock = document.createElement('p');
      if (_events[eventDate]) {
        elEventBlock = _events[eventDate];
        elEventBlock.appendChild(document.createElement('br'));
      }
      
    	if (image != "") {
    	  var elImg = document.createElement('img');
    	  elImg.setAttribute('src', image);
    	  elImg.setAttribute('width', width);
    	  elImg.setAttribute('height', height);
    	  elImg.setAttribute('align', 'left');
    	  elImg.setAttribute('valign', 'top');
    	  elEventBlock.appendChild(elImg);
    	}
    	if (eventLink != "") {
    	  var elA = document.createElement('a');
    	  elA.setAttribute('href', eventLink);
    	  elA.innerHTML = eventDescription;
    	  elEventBlock.appendChild(elA);
    	}
      _events[eventDate] = elEventBlock; 
    	// Adjust the minimum and maximum month & year to include this date
    	var tmp = Math.floor(eventDate / 100);
    	if (tmp < _firstMonth) _firstMonth = tmp;
    	if (tmp > _lastMonth) _lastMonth = tmp;
    },
    
    // Calendar( ) is the only routine that needs to be called to display the calendar

    showCalendar: function() {
      var curdy, curmo, yr, mo, dy, dayofweek, yearmonth, bgn, lastday, jump;
      var weekdays = new _arr("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
      var thispage = window.location.pathname;

      // Save current day and month for comparison
      curdy = _today.getDate();
      curmo = _today.getMonth()+1;

      // Default to current month and year
      mo = curmo;
      yr = _getFullYear(_today);
      yearmonth = (yr * 100) + mo;

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
      bgn = new Date(_months[mo] + " 1," + yr);
      
      // Get the day-of-week of the first day, and the # days in the month
      dayofweek = bgn.getDay();
      lastday = _numDaysIn(mo,yr);
      
      var elThead = document.createElement('thead');
      var elTr = document.createElement('tr');
      var elTh = document.createElement('th');
      elTh.setAttribute('colspan', 7);
      elTh.innerHTML = _months[mo] + ' ' + yr;
      elTr.appendChild(elTh);
      elThead.appendChild(elTr);
      elTr = document.createElement('tr');
      for (var i=1;i<=7;i++){
        elTh = document.createElement('th');
        elTh.innerHTML = weekdays[i];
        elTr.appendChild(elTh);
        elThead.appendChild(elTr);
      }

      var elTbody = document.createElement('tbody');
      elTr = document.createElement('tr');
      var elTd = document.createElement('td');
      dy = 1;
      // Special handling for the first week of the month
      for (var i=1;i<=7;i++) {
        elTd = document.createElement('td');
        if (i > dayofweek) {
          elTd.appendChild(_buildDate(yr,mo,dy,i,curmo,curdy));
          dy++;
        }
        elTr.appendChild(elTd);
      }
      elTbody.appendChild(elTr);

      // Rest of the weeks . . .
      while (dy <= lastday) {
        elTr = document.createElement('tr');
        for (var i=1;i<=7;i++) {
          elTd = document.createElement('td');
          if (dy <= lastday) {
            elTd.appendChild(_buildDate(yr,mo,dy,i,curmo,curdy));
            dy++;
          }
          elTr.appendChild(elTd);
        }
        elTbody.appendChild(elTr);
      }

      var elTfoot = document.createElement('tfoot');
      elTr = document.createElement('tr');
      elTh = document.createElement('th');
      elTh.setAttribute('colspan', 7);      
      if (yearmonth > _firstMonth) {
        var elA = document.createElement('a');
        elA.setAttribute('href', '');
        elA.innerHTML = '&lt;-- View' + _months[_prevMonth(mo)];
        elTh.appendChild(elA);
      }
      if ((yearmonth > _firstMonth) && (yearmonth < _lastMonth)) {
        var elSpan = document.createElement('span');
        elSpan.innerHTML = '&nbsp;|&nbsp;';
        elTh.appendChild(elSpan);
      }
      if (yearmonth < _lastMonth) {
        var elA = document.createElement('a');
        elA.setAttribute('href', '');
        elA.innerHTML = 'View ' + _months[_nextMonth(mo)] + ' --&gt;';
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
      elTh.appendChild(_buildSelectionList(yearmonth, thispage));
      elTr.appendChild(elTh);
      elTfoot.appendChild(elTr);
      
      var elTable = document.createElement('table');
      elTable.appendChild(elThead);
      elTable.appendChild(elTbody);
      elTable.appendChild(elTfoot);

      _Event.add(window, 'load', function() {
        _Dom.empty(_calendarContainer);
        _calendarContainer.appendChild(elTable);
      });
    }

  };
  
};




