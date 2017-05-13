const Sequelize = require('sequelize');
const path = require('path');
var sql

if (process.env.NODE_ENV === 'development') {
	console.log('dev setup')
  sql = new Sequelize('bartrDB', null, null, {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'bartr.sqlite3'),
    define: {
      underscored: true
    }
  });
} else {
	var cls = require('continuation-local-storage');
	var namespace = cls.createNamespace('my-namespace');
	Sequelize.cls = namespace;
  sql= new Sequelize(process.env.DATABASE_URL, {
    "dialect":"postgres",
    "ssl":true,
    "define": {
      "underscored": true
    },
    "dialectOptions":{
      "ssl":{
        "require":true
      }
    }
	});
}

const Engagement = sql.define('engagement', {
		complete: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
      defaultValue: false
		}
});

const Message = sql.define('message', {
		message: {
			type: Sequelize.TEXT,
			allowNull: false
		}
});
 
const Review = sql.define('review', {
		score: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		review: {
			type: Sequelize.TEXT,
			allowNull: false
		}
});

const User = sql.define('user', {
		email: {
			type: Sequelize.STRING,
			allowNull: true,
			unique: false,
      validate: { isEmail: true }
		},
		name: {
			type: Sequelize.STRING,
			allowNull: true
		},
		address: {
			type: Sequelize.STRING,
			allowNull: true
		},
		geo_lat: {
			type: Sequelize.FLOAT(10,6),
			allowNull: true
		},
		geo_long: {
			type: Sequelize.FLOAT(10,6),
			allowNull: true
		},
		auth0_id: {
			type: Sequelize.STRING,
			allowNull: false,
      unique: true
		},
		service_provider_average_rating: {
			type: Sequelize.INTEGER,
			allowNull: true
		}
}, {
	indexes: [
		{fields: ['geo_long', 'geo_lat']}
	]
});

const Service = sql.define('service', {
  type: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Schedule = sql.define('schedule', {
  start: {
    type: Sequelize.DATE,
    allowNull: false
  },
	end: {
  	type: Sequelize.DATE,
		allowNull: false,
	}
},{
	timestamps: false,
});

const ServiceValue = sql.define('service_value', {
	value: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	user_id: {
		type: Sequelize.INTEGER,
		unique: true,
		primaryKey: true
	}
});

const AverageASV = sql.define('average_asv', {
	value: {
		type: Sequelize.FLOAT,
		allowNull: false
	},
});

const ServiceTransaction = sql.define('service_transaction', {
	sender_svc_units: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	}, 
	receiver_svc_units: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	sender_svc_currval: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	receiver_svc_currval: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	sender_asv: {
		type: Sequelize.FLOAT
	},
	receiver_asv: {
		type: Sequelize.FLOAT
	},
	accepted: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

User.belongsTo(Service);
Service.hasMany(User);
User.hasOne(ServiceValue);
ServiceValue.belongsTo(Service);
Service.hasMany(ServiceValue);
AverageASV.belongsTo(Service);
Service.hasMany(AverageASV);

ServiceTransaction.belongsTo(Service, { as: 'sender_service', foreignKey: { name: 'sender_service_id', allowNull: false }, onDelete: 'CASCADE' });
ServiceTransaction.belongsTo(Service, { as: 'receiver_service', foreignKey: { name: 'receiver_service_id', allowNull: false }, onDelete: 'CASCADE' });
Service.hasMany(ServiceTransaction, { as: 'sender_transaction', foreignKey: 'sender_service_id'});
Service.hasMany(ServiceTransaction, { as: 'receiver_transaction', foreignKey: 'receiver_service_id'});

Engagement.hasOne(ServiceTransaction);

User.hasMany(Schedule);
Schedule.belongsTo(User);

Engagement.belongsTo(User,  { as: 'sender', foreignKey: { name: 'sender_id', allowNull: false }, onDelete: 'CASCADE' });
Engagement.belongsTo(User, { as: 'receiver', foreignKey: { name: 'receiver_id', allowNull: false }, onDelete: 'CASCADE' });
User.hasMany(Engagement, { as: 'sent_engagements', foreignKey: 'sender_id'});
User.hasMany(Engagement, { as: 'received_engagements', foreignKey: 'receiver_id'});

Message.belongsTo(Engagement);
Engagement.hasMany(Message);
Message.belongsTo(User,  { as: 'sender', foreignKey: { name: 'sender_id', allowNull: false }, onDelete: 'CASCADE' });
Message.belongsTo(User,  { as: 'receiver', foreignKey: { name: 'receiver_id', allowNull: false }, onDelete: 'CASCADE' });
User.hasMany(Message, { as: 'sent_messages', foreignKey: 'sender_id'});
User.hasMany(Message, { as: 'received_messages', foreignKey: 'receiver_id'});

Review.belongsTo(Engagement);
Engagement.hasMany(Review);
Review.belongsTo(User,  { as: 'sender', foreignKey: { name: 'sender_id', allowNull: false }, onDelete: 'CASCADE' });
Review.belongsTo(User,  { as: 'receiver', foreignKey: { name: 'receiver_id', allowNull: false }, onDelete: 'CASCADE' });
User.hasMany(Review, { as: 'sent_reviews', foreignKey: 'sender_id'});
User.hasMany(Review, { as: 'received_reviews',foreignKey: 'receiver_id'});

module.exports.User = User;
module.exports.Service = Service;
module.exports.ServiceValue = ServiceValue;
module.exports.AverageASV = AverageASV;
module.exports.ServiceTransaction = ServiceTransaction;
module.exports.Review = Review;
module.exports.Message = Message;
module.exports.Engagement = Engagement;
module.exports.Schedule = Schedule;
module.exports.sql = sql;
