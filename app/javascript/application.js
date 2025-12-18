// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"


document.addEventListener("DOMContentLoaded", () => {
  const showModal = document.getElementById("showModal");
  
  showModal.addEventListener("show.bs.modal", event => {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-id");

    fetch(`/locations/${id}/modal_show`)
      .then(res => res.text())
      .then(html => {
        document.getElementById("show-modal-body").innerHTML = html;
      });
  });

  const editModal = document.getElementById("editModal");

  editModal.addEventListener("show.bs.modal", event => {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-id");

    fetch(`/locations/${id}/modal_edit`)
      .then(res => res.text())
      .then(html => {
        document.getElementById("edit-modal-body").innerHTML = html;
      });
  });

  const deleteModal = document.getElementById("deleteModal")
  if (!deleteModal) return

  deleteModal.addEventListener("show.bs.modal", event => {
    const button = event.relatedTarget
    const id = button.getAttribute("data-id")
    const name = button.getAttribute("data-name")

    document.getElementById("delete-location-name").textContent = name
    document.getElementById("delete-form").action = `/locations/${id}`
  })


  const manualCreateModal = document.getElementById("manualCreateModal")
  if (manualCreateModal) {
    manualCreateModal.addEventListener("show.bs.modal", () => {
      fetch("/locations/modal_new")
        .then(res => res.text())
        .then(html => {
          document.getElementById("manual-create-modal-body").innerHTML = html
        })
    })
  }

const mapDiv = document.getElementById("main-map");
const modalPlaceholder = document.getElementById("modal-map-placeholder");

showModal.addEventListener("shown.bs.modal", () => {
  // Move the map into the modal
  modalPlaceholder.appendChild(mapDiv);

  // Leaflet must recalc size now that container is visible
  if (window.locationMap) {
    window.locationMap.invalidateSize();
  }
});

showModal.addEventListener("hidden.bs.modal", () => {
  // Move the map back to original place
  document.querySelector("[data-location-target='canvas']").appendChild(mapDiv);

  if (window.locationMap) {
    window.locationMap.invalidateSize();
  }
});


});
