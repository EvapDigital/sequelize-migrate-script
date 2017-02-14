module.exports = function (sequelize, DataType) {

  return sequelize.queryInterface.addColumn({
      tableName: 'clients'
    },
    'cars_linked',{
      type : DataType.INTEGER
    });
}
