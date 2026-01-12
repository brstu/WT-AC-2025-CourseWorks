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
    const createShelfArea = document.getElementById('createShelfArea');
    if(createShelfArea){ createShelfArea.classList.toggle('d-none', !token); }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    updateNav();
    const logout = document.getElementById('logoutLink');
    if(logout) logout.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('token'); sessionStorage.removeItem('token'); updateNav(); location.reload(); });

    const createForm = document.getElementById('createShelfForm');
    if(createForm){
      createForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const nameEl = document.getElementById('shelfName');
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
})();
