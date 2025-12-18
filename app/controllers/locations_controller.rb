class LocationsController < ApplicationController
  before_action :set_location, only: %i[ show edit update destroy ]

  def index
    @locations = Location.all
  end

  def show
  end

  def new
    @location = Location.new
  end

  # GET /locations/1/edit
  def edit
  end

  # POST /locations or /locations.json
  def create
    @location = Location.new(location_params)

    respond_to do |format|
      if @location.save
        format.html { redirect_to locations_path, notice: "Location created." }
        format.json { render json: @location }
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            "locations_table",
            partial: "locations/table",
            locals: { locations: @locations }
          )
        end
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @location.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @location.update(location_params)
        format.html { redirect_to locations_path, notice: "Location updated." }
        format.json { render :show, status: :ok, location: @location }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @location.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @location.destroy!

    redirect_to locations_path, notice: "Location deleted."

    # respond_to do |format|
    #   format.html { redirect_to locations_path, notice: "Location was successfully destroyed.", status: :see_other }
    #   format.json { head :no_content }
    # end
  end

  def modal_show
    @location = Location.find(params[:id])
    render partial: "show", locals: { location: @location }
  end

  def modal_edit
    @location = Location.find(params[:id])
    render partial: "form", locals: { location: @location }
  end

  def modal_new
    @location = Location.new
    render partial: "modal_new"
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_location
      @location = Location.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def location_params
      params.expect(location: [ :name, :latitude, :longitude, :radius ])
    end
end
