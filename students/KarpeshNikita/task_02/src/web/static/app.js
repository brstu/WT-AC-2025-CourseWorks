(function(){
  const getToken = ()=> localStorage.getItem('token') || sessionStorage.getItem('token');

  function updateNav(){
    const token = getToken();
    const guest = document.getElementById('nav-guest');
    const user = document.getElementById('nav-user');
    if(guest && user){
      if(token){ guest.style.display='none'; user.style.display='inline'; }
      else { guest.style.display='inline'; user.style.display='none'; }
    }
    const createShelfArea = document.getElementById('create-shelf-area');
    if(createShelfArea){ createShelfArea.classList.toggle('d-none', !token); }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    updateNav();
    const logout = document.getElementById('logout-link');
    if(logout) logout.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('token'); sessionStorage.removeItem('token'); updateNav(); location.reload(); });

    const createForm = document.getElementById('create-shelf-form');
    if(createForm){
      createForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const nameEl = document.getElementById('shelf-name');
        const name = nameEl && nameEl.value.trim();
        if(!name){ alert('Enter shelf name'); return; }
        const token = getToken();
        if(!token){ alert('You must be logged in to create a shelf.'); return; }
        try{
          const res = await fetch('/api/shelves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ name })
          });
          if(res.ok){ location.reload(); }
          else { const d = await res.json().catch(()=>({})); alert(d.error || 'Create shelf failed'); }
        } catch(err){ alert('Network error'); }
      });
    }
  });
    const importToggle = document.getElementById('import-toggle');
    const importArea = document.getElementById('import-area');
    const importForm = document.getElementById('import-form');
    if(importToggle && importArea){
      importToggle.addEventListener('click', ()=>{ importArea.classList.toggle('d-none'); });
    }
    if(importForm){
      importForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const fileEl = document.getElementById('import-file');
        const formatEl = document.getElementById('import-format');
        if(!fileEl || !fileEl.files || fileEl.files.length === 0){ alert('Select a file to import'); return; }
        const file = fileEl.files[0];
        const format = formatEl && formatEl.value === 'csv' ? 'csv' : 'json';
        const fd = new FormData();
        fd.append('file', file, file.name);
        const token = getToken();
        try{
          const res = await fetch('/api/books/import/' + format, {
            method: 'POST',
            headers: token ? { 'Authorization': 'Bearer ' + token } : {},
            body: fd
          });
          if(res.ok){ alert('Imported successfully'); location.reload(); }
          else { const d = await res.json().catch(()=>({})); alert(d.error || 'Import failed'); }
        }catch(err){ alert('Network error'); }
      });
    }
})();
