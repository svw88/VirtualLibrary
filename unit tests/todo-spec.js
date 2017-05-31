describe('ShipIt homepage', function() {

   beforeEach(function() {
    browser.get('http://localhost:8080');
  });

  it('should retrieve favorites', function() {
    $$('.dropdown-menu li').then(function(items) {
      expect(items.length).toBe(3);
    });
      
  });

  it('should send request', function() {
    var search = element(by.id('searchButton'));
    var searchInput = element(by.id('searchInput'));
    searchInput.sendKeys('s');
    search.click();     
    var title = element(by.binding('title'));
    expect(title.getAttribute("innerText")).toBe('Results For : s');
  });

  it('should retrieve 4 results', function() {
    var search = element(by.id('searchButton'));
    var searchInput = element(by.id('searchInput'));
    searchInput.sendKeys('s');
    search.click();    
    $$('.result-frame').then(function(items) {
      expect(items.length).toBe(4);
    });
  });

  it('should do pagination of results', function() {
    var search = element(by.id('searchButton'));
    var searchInput = element(by.id('searchInput'));
    searchInput.sendKeys('s');
    search.click();    
    var next = element(by.id('next'));
    next.click();
     $$('.result-frame').then(function(items) {
      expect(items.length).toBe(4);
    });
     var prev = element(by.id('previous'));
    prev.click();
     $$('.result-frame').then(function(items) {
      expect(items.length).toBe(4);
    });
  });

  it('should open single result page with option to go back', function() {
    var search = element(by.id('searchButton'));
    var searchInput = element(by.id('searchInput'));
    searchInput.sendKeys('s');
    search.click();    
     var info = element(by.id('info'));
     info.click();
     var title = element(by.binding('results.volumeInfo.title'));
     expect(title.getAttribute("innerText")).toBe('Book Not Found');
     var back = element(by.id('back'));
     back.click();
      $$('.result-frame').then(function(items) {
      expect(items.length).toBe(4);
    });
  });

  it('should add and remove favorites', function() {
    var search = element(by.id('searchButton'));
    var searchInput = element(by.id('searchInput'));
    searchInput.sendKeys('s');
    search.click();  
     $$('.dropdown-menu li').then(function(items) {
      expect(items.length).toBe(3);
    });
    var addFav = element(by.id('addFav'));
    addFav.click();
     $$('.dropdown-menu li').then(function(items) {
      expect(items.length).toBe(4);
    });
     var removeFav = element(by.id('removeFav'));
    removeFav.click();
     $$('.dropdown-menu li').then(function(items) {
      expect(items.length).toBe(3);
    });

  });

  it('should open book page from favorites', function() {
    $$('.dropdown a').then(function(items) {

      items[0].click();;     
    });

     $$('.dropdown-menu a').then(function(items) {
       var titleTest =items[4].getAttribute("innerText");
      items[4].click();
       var title = element(by.binding('results.volumeInfo.title'));
     expect(title.getAttribute("innerText")).toBe(titleTest);     
    });

  });

  
  it('should remove from favorites menu', function() {
    $$('.dropdown a').then(function(items) {
		
      items[0].click();;     
    });

     $$('.dropdown-menu a').then(function(items) {
       
      items[5].click();
    });

          
      $$('.dropdown-menu li').then(function(items) {
      expect(items.length).toBe(2);

       var search = element(by.id('searchButton'));
    var searchInput = element(by.id('searchInput'));
    searchInput.sendKeys('s');
    search.click();  

    
    $$('.result-frame a').then(function(items) {
      items[2].click();
    });

         $$('.dropdown-menu li').then(function(items) {
      expect(items.length).toBe(3);
    });
    });

  });

});