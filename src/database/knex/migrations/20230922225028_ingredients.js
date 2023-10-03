exports.up = knex => knex.schema.createTable("ingredients", table => {
  table.increments("id");
  table.text("name");
  table.integer('food_id').unsigned().references('id').inTable('foods').onDelete('CASCADE');
});

exports.down = knex => knex.schema.dropTable("ingredients");

