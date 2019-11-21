const scraper = require('web-scraper-js');
const cheerio = require('cheerio');
const request = require('request');

// Globals
const DOMAIN = 'hosthamilton.com';
const URL = 'http://www.' + DOMAIN + '/';

const filterLinks = array => {
  let unique = [...new Set(array)];
  var filteredLinks = unique.filter(function(value, index, arr) {
    if (!value.startsWith('#') && !value.startsWith('mailto')) {
      return true;
    }
  });
  filteredLinks.forEach(function(value, index, array) {
    if (!value.startsWith('http')) {
      filteredLinks[index] = URL + '/' + value;
    }
  });
  filteredLinks = filteredLinks.filter(function(value, index, array) {
    if (value.includes(DOMAIN)) {
      return true;
    }
  });
  return filteredLinks;
};

const hasNumber = myString => {
  return /\d/.test(myString);
};

const hasPostalCode = myString => {
  return /^(\d{5}((|-)-\d{4})?)|([A-Za-z]\d[A-Za-z][\s\.\-]?(|-)\d[A-Za-z]\d)|[A-Za-z]{1,2}\d{1,2}[A-Za-z]? \d[A-Za-z]{2}$/.test(
    myString
  );
};

const scrapeNumbers = async url => {
  let params = {
    url: url,
    tags: {
      text: {
        paragraphs: 'p',
        headings: 'h1,h2,h3,h4,h5,h6'
      }
    }
  };
  try {
    let raw = await scraper.scrape(params);

    let pNumbers = raw.paragraphs.filter(function(value, index, arr) {
      if (hasNumber(value)) {
        if (hasPostalCode(value)) {
          return true;
        }
      }
    });

    let hNumbers = raw.headings.filter(function(value, index, arr) {
      if (hasNumber(value)) {
        if (hasPostalCode(value)) {
          return true;
        }
      }
    });

    if (pNumbers != '') console.log(`${URL}: <p>  ${pNumbers}`);
    if (hNumbers != '') console.log(`${URL}: <h?>  ${hNumbers}`);
  } catch (err) {
    // console.log('error: ', err);
  }
};

// Main starting point
const init = () => {
  request(URL, function(error, response, body) {
    if (error) {
      throw error;
    }
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);

      let links = $('a')
        .map(function(i) {
          return $(this).attr('href');
        })
        .get();

      let filteredLinks = filterLinks(links);
      // console.log(filteredLinks);

      for (let u in filteredLinks) {
        scrapeNumbers(filteredLinks[u]);
      }
    }
  });
};

// Run init
// main startup and try/catch
try {
  init();
} catch (err) {
  console.log('error: ', err);
}
