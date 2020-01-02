CREATE TABLE IF NOT EXISTS jl_message (
    messageId bigint  primary key not NULL,
    objectName varchar(100) NOT NULL,
    receivedTime bigint  NOT NULL,
    senderUserId varchar(20) NOT NULL,
    sentStatus varchar(50) NOT NULL,
    sentTime bigint not null,
    targetId varchar(20) not null,
    contentText varchar(250) not null,
    contentExtra text not null,
    contentType varchar(20) not null,
    created bigint not null,
    read boolean not null default '0',
    readTime bigint not null default '0'
);

CREATE TABLE IF NOT EXISTS jl_message_title(
    targetUserId varchar(20) primary key  not null,
    updated bigint not null,
    messageId bigint not null
);