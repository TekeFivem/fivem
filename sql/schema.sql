CREATE TABLE IF NOT EXISTS auctions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  kind          ENUM('storage','container','itembox') NOT NULL,
  name          VARCHAR(32) NOT NULL,
  tier          ENUM('bronze','silver','gold') NOT NULL,
  base_bid      INT NOT NULL,
  current_price INT NOT NULL DEFAULT 0,
  start_time    BIGINT NOT NULL,
  end_time      BIGINT NOT NULL,
  status        ENUM('upcoming','open','final','ended') NOT NULL DEFAULT 'upcoming',
  prev_owner    VARCHAR(64) NULL,
  winner_id     VARCHAR(64) NULL,
  paid          INT NULL,
  contents_json LONGTEXT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auction_participants (
  auction_id INT NOT NULL,
  citizenid  VARCHAR(64) NOT NULL,
  joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (auction_id, citizenid)
);

CREATE TABLE IF NOT EXISTS auction_bids (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  auction_id INT NOT NULL,
  citizenid  VARCHAR(64) NOT NULL,
  amount     INT NOT NULL,
  hidden     TINYINT(1) NOT NULL DEFAULT 0,
  is_final   TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (auction_id)
);

CREATE TABLE IF NOT EXISTS auction_scratch (
  auction_id INT NOT NULL,
  citizenid  VARCHAR(64) NOT NULL,
  cell_index TINYINT NOT NULL,
  item_id    VARCHAR(32) NULL,
  opened_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (auction_id, citizenid, cell_index)
);

CREATE TABLE IF NOT EXISTS auction_hacks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  auction_id INT NOT NULL,
  actor_id   VARCHAR(64) NOT NULL,
  target_id  VARCHAR(64) NOT NULL,
  hack_type  VARCHAR(16) NOT NULL,
  cost       INT NOT NULL,
  exposed    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (auction_id)
);

CREATE TABLE IF NOT EXISTS player_hack_trace (
  citizenid   VARCHAR(64) PRIMARY KEY,
  trace_level INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auction_chat (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  auction_id INT NOT NULL,
  citizenid  VARCHAR(64) NOT NULL,
  message    VARCHAR(256) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (auction_id)
);