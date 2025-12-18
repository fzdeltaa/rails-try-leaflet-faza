import { Controller } from "@hotwired/stimulus"
import L from "leaflet"

export default class extends Controller {
  static targets = [
    "canvas",
    "toggleBtn",
    "name",
    "lat",
    "lng",
    "radius"
  ]
  static values = {
    markers: Array
  }

  connect() {
    this.isAddingMarker = false
    this.modalMaps = {} // Store modal map instances

    this.map = L.map(this.canvasTarget).setView(
      [-7.811152648715536, 110.38536235457327],
      17
    )

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(this.map)

    // Existing markers
    this.markersValue.forEach(point => {
      this.drawMarker(point)
    })

    this.map.on("click", e => this.handleMapClick(e))

    // Initialize modal map listeners
    this.setupModalMaps()
  }

  disconnect() {
    this.map.remove()
    // Clean up modal maps
    Object.values(this.modalMaps).forEach(map => {
      if (map) map.remove()
    })
  }

  toggleAddMode() {
    this.isAddingMarker = !this.isAddingMarker
    this.updateToggleUI()
  }

  updateToggleUI() {
    const btn = this.toggleBtnTarget

    if (this.isAddingMarker) {
      btn.textContent = "Cancel Adding"
      btn.classList.remove("btn-outline-primary")
      btn.classList.add("btn-danger")
      this.canvasTarget.style.cursor = "crosshair"
    } else {
      btn.textContent = "Add Mode"
      btn.classList.remove("btn-danger")
      btn.classList.add("btn-outline-primary")
      this.canvasTarget.style.cursor = ""
    }
  }

  handleMapClick(e) {
    if (!this.isAddingMarker) return

    const name = prompt("Location name?")
    if (!name) return

    const radius = Number(prompt("Radius (meters)?"))
    if (!radius || radius <= 0) return

    this.createLocation({
      name,
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
      radius
    })
  }

  createLocation(data) {
    fetch("/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": document
          .querySelector("meta[name='csrf-token']")
          .content
      },
      body: JSON.stringify({ location: data })
    })
      .then(res => {
        if (!res.ok) throw res
        return res.json()
      })
      .then(location => {
        this.drawMarker(location)

        const frame = document.getElementById("locations_table")
        frame.src = window.location.href
      })
      .catch(async err => {
        console.error("Save failed:", await err.text())
        alert("Failed to save location")
      })
  }

  drawMarker(location) {
    L.marker([location.latitude, location.longitude])
      .addTo(this.map)
      .bindPopup(location.name)

    L.circle([location.latitude, location.longitude], {
      radius: location.radius,
      color: "red",
      fillOpacity: 0.4
    }).addTo(this.map)
  }

  centerOn(event) {
    console.log("clicked")
    const button = event.currentTarget
    const lat = Number(button.dataset.lat)
    const lng = Number(button.dataset.lng)

    this.map.flyTo([lat, lng], 18, {
      animate: true,
      duration: 0.6
    })
  }

  setupModalMaps() {
    // Setup show modal map
    const showModal = document.getElementById("showModal")
    if (showModal) {
      showModal.addEventListener("show.bs.modal", (e) => {
        const locationId = e.relatedTarget?.dataset.id
        showModal.dataset.currentLocationId = locationId
      })
      showModal.addEventListener("shown.bs.modal", () => {
        this.initializeModalMap("show-map", "show")
      })
    }

    // Setup edit modal map
    const editModal = document.getElementById("editModal")
    if (editModal) {
      editModal.addEventListener("show.bs.modal", (e) => {
        const locationId = e.relatedTarget?.dataset.id
        editModal.dataset.currentLocationId = locationId
      })
      editModal.addEventListener("shown.bs.modal", () => {
        this.initializeModalMap("edit-map", "edit")
      })
    }
  }

  initializeModalMap(containerId, mapType) {
    const container = document.getElementById(containerId)
    if (!container) return

    // Get the modal to find current location ID
    const modal = mapType === "show" 
      ? document.getElementById("showModal") 
      : document.getElementById("editModal")
    const locationId = modal?.dataset.currentLocationId

    // If map already exists, just invalidate its size
    if (this.modalMaps[mapType]) {
      this.modalMaps[mapType].invalidateSize()
      // Focus on the marker if locationId exists
      if (locationId) {
        const location = this.markersValue.find(m => m.id == locationId)
        if (location) {
          this.modalMaps[mapType].flyTo(
            [location.latitude, location.longitude],
            18,
            { animate: true, duration: 0.6 }
          )
        }
      }
      return
    }

    // Create new map
    const map = L.map(container).setView(
      [-7.811152648715536, 110.38536235457327],
      17
    )

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map)

    // Draw all markers on modal map
    this.markersValue.forEach(point => {
      L.marker([point.latitude, point.longitude])
        .addTo(map)
        .bindPopup(point.name)

      L.circle([point.latitude, point.longitude], {
        radius: point.radius,
        color: "red",
        fillOpacity: 0.4
      }).addTo(map)
    })

    // Focus on the specific location if locationId exists
    if (locationId) {
      const location = this.markersValue.find(m => m.id == locationId)
      if (location) {
        map.setView([location.latitude, location.longitude], 18)
      }
    }

    this.modalMaps[mapType] = map
  }

  reloadTable() {
    const frame = document.getElementById("locations_table_frame")
    frame.src = frame.src
  }

  addManualLocation() {
    const name = document.getElementById("manual-name").value
    const lat = Number(document.getElementById("manual-lat").value)
    const lng = Number(document.getElementById("manual-lng").value)
    const radius = Number(document.getElementById("manual-radius").value)

    if (!name || !lat || !lng || !radius) {
      alert("All fields required")
      return
    }

    this.createLocation({
      name,
      latitude: lat,
      longitude: lng,
      radius
    })

    // Clear inputs
    document.getElementById("manual-name").value = ""
    document.getElementById("manual-lat").value = ""
    document.getElementById("manual-lng").value = ""
    document.getElementById("manual-radius").value = ""
  }
}
