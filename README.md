# Listen to ESP32 GPIOs from ANYWHERE in the World - ESP32 Control Panel - ReactJS Web App

This repository has been created as a part of the YouTube video:
[Listen to ESP32 GPIOs from ANYWHERE in the World [Step-By-Step Tutorial]](https://youtu.be/5Q1cyi6IJzw)

This is ReactJS Application to control and listen to ESP32 GPIO pins from the browser through AWS API Gateway WebSockets Server.

## Installation

Run:

```bash
npm install
```

or

```
yarn install
```

## Usage

Run:

```
npm run dev
```

or:

```
yarn dev
```

## Creating Infrastructure

Run:

```
npm run create-infrastructure
```

or:

```
yarn create-infrastructure
```

If get following error message:

```
An error occurred (BucketAlreadyExists) when calling the CreateBucket operation: The requested bucket name is not available. The bucket namespace is shared by all users of the system. Please select a different name and try again.
```

It means the bucket name you're trying to use is already taken.
To use different bucket name run:

```
git reset --hard
```

And:

```
npm run create-infrastructure
```

again but provide different bucket name when prompted.

## Licence

MIT.
