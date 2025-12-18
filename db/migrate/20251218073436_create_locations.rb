class CreateLocations < ActiveRecord::Migration[8.1]
  def change
    create_table :locations do |t|
      t.string :name
      t.float :latitude
      t.float :longitude
      t.integer :radius

      t.timestamps
    end
  end
end
