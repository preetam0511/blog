document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.querySelector('.searcBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchClose = document.getElementById('searchClose');
  
    if (searchBtn && searchBar) {
      searchBtn.addEventListener('click', function() {
        searchBar.style.display = 'block';
      });
    }
  
    if (searchClose && searchBar) {
      searchClose.addEventListener('click', function() {
        searchBar.style.display = 'none';
      });
    }
  });