create database event_management;
use event_management;

create table if not exists users (
    id int auto_increment primary key,
    name varchar(100) not null,
    email varchar(100) not null unique,
    password varchar(255) not null,
    role enum('admin', 'student') default 'student',
    created_at timestamp default current_timestamp
);

create table if not exists programmes (
    id int auto_increment primary key,
    title varchar(100) not null,
    description text,
    location varchar(150),
    event_date date not null,
    event_time time,
    organizer varchar(100),
    max_seats int default 50,
    created_at timestamp default current_timestamp
);

create table if not exists registrations (
    id int auto_increment primary key,
    event_id int not null,
    user_id int not null,
    name varchar(100) not null,
    email varchar(100) not null,
    phone varchar(15),
    registered_at timestamp default current_timestamp,
    foreign key (event_id) references programmes(id) on delete cascade,
    foreign key (user_id) references users(id) on delete cascade
);
