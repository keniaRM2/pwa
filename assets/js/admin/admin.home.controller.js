(() => {
  'use strict';
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.clear();
    changeView('');
  }
})();
const incidenceDB= new PouchDB('incidences');
const aceptIncidences = async (id) => {
  try {
    const response=await axiosClient.post('/incidences/status',
    {
      id,
      status:{
        id:4,
      },
    } );
    if(response['changed']){
      toasMessage('Estado cambiado correctamente').showToast();
      getAllIcidencesPeding();

    }
  } catch (error) {
    console.log(error);
    toasMessage('Error ak cambiar el estado').showToast();
  }
};
const rejectIncidences = async (id) => {
  try {
    const response=await axiosClient.post('/incidences/status',
    {
      id,
      status:{
        id:6,
      },
    } );
    if(response['changed']){
      toasMessage('Estado cambiado correctamente').showToast();
      getAllIcidencesPeding();

    }
  } catch (error) {
    console.log(error);
    toasMessage('Error ak cambiar el estado').showToast();
  }
};
const getAllIcidencesPeding=async ()=>{
try {
  const table=$("#incidencesTable").DataTable();
  table.destroy();
  const user =parseJWT();
  const response=await axiosClient.get(`/incidences/pending/${user.id}`);
  const tableBody=$("#incidencesBody");
  let content='';
  tableBody.html('');
  const {rows}=await incidenceDB.allDocs({include_docs: true});
  for (const [i,incidence] of response?.incidences.entries()) {
    const incidenceDate=new Date(incidence.incidenceDate);
    const day=String(incidenceDate.getDate()).padStart(2,'0');
    const mes =String(incidenceDate.getMonth()+1).padStart(2,'0');
    const year=String(incidenceDate.getFullYear());
    content += `
<tr>
<td>${i+1}</td>
<td>${incidence.person.name} ${incidence.person.surname}
${incidence.person.lastname ?? ''}
</td>
<td>${incidence.user.area.name}</td>
<td>${day} / ${mes}/ ${year}</td>
<td>${
  rows.find(rows=> rows.doc.id=== incidence.id)
  ?
  `
  <button class="btn btn-success btn-sm"disabled>Aceptar</button>
  <button class="btn btn-danger btn-sm" disabled>Rechazar</button>
  `:`
  <button class="btn btn-success btn-sm" onclick="aceptIncidences(${incidence.id})">Aceptar</button>
  <button class="btn btn-danger btn-sm" onclick="rejectIncidences(${incidence.id})">Rechazar</button>
  
  `
}</td>
</tr>
    `;
    
  }
  tableBody.html(content);
  
  new DataTable(document.getElementById('incidencesTable'), {
    columnDefs: [{ orderable: false, targets: 4 }],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
    },
  });
} catch (error) {
  console.log(error);
}
};
$(document).ready(function () {
  if (!fullname) fullname = localStorage.getItem('fullname');
  if (!role) role = localStorage.getItem('activeRole');
  $('#fullname').text(fullname);
  $('#fullname2').text(fullname);
  $('#role').text(role);
getAllIcidencesPeding();
navigator.serviceWorker.addEventListener('message',(event) => {
  if(event.data && event.data.type === 'RELOAD_PAGE_AFTER_SYNC')
  window.location.reload(true);
});
});
