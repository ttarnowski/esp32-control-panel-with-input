import { useEffect, useState } from "react";
import "./App.css";
import useWebSocket from "react-use-websocket";

type MessageBody = {
  action: string;
  type: string;
  body: unknown;
};

const outputPins = [18, 19, 22, 23];
const defultOutputPin = outputPins[0];

function App() {
  const { lastMessage, sendMessage, readyState } = useWebSocket(
    "wss://YOUR_API_GW_ID.execute-api.REGION.amazonaws.com/dev"
  );
  const [digitalInputPins, setDigitalInputPins] = useState<number[]>([
    12, 13, 14, 27,
  ]);
  const [digitalListenPins, setDigitalListenPins] = useState<number[]>([]);
  const [selectedDigitalInputPin, setSelectedDigitalInputPin] = useState(
    digitalInputPins[0]
  );

  const [analogInputPins, setAnalogInputPins] = useState<number[]>([
    32, 33, 34, 35,
  ]);
  const [analogListenPins, setAnalogListenPins] = useState<number[]>([]);
  const [selectedAnalogInputPin, setSelectedAnalogInputPin] = useState(
    analogListenPins[0]
  );

  const [selectedOutputPin, setSelectedOuputPin] = useState(defultOutputPin);
  const [outPinValue, setOutputPinValue] = useState(false);
  const [pinsValueMap, setPinsValueMap] = useState<Record<number, number>>({});

  useEffect(() => {
    setSelectedDigitalInputPin(digitalInputPins[0]);
  }, [digitalInputPins, setSelectedDigitalInputPin]);

  useEffect(() => {
    setSelectedAnalogInputPin(analogInputPins[0]);
  }, [analogInputPins, setSelectedAnalogInputPin]);

  useEffect(() => {
    if (lastMessage === null) {
      return;
    }

    const parsedMessage = JSON.parse(lastMessage.data) as MessageBody;

    if (parsedMessage.action !== "msg") {
      return;
    }

    if (parsedMessage.type === "output") {
      const body = parsedMessage.body as number;

      setOutputPinValue(body === 0 ? false : true);
    }

    if (parsedMessage.type === "pinChange") {
      const body = parsedMessage.body as { pin: number; value: number };

      setPinsValueMap((prev) => ({
        ...prev,
        [body.pin]: body.value,
      }));
    }
  }, [lastMessage, setOutputPinValue]);

  useEffect(() => {
    sendMessage(
      JSON.stringify({
        action: "msg",
        type: "cmd",
        body: {
          type: "digitalRead",
          pin: defultOutputPin,
        },
      })
    );

    outputPins.forEach((pin) => {
      sendMessage(
        JSON.stringify({
          action: "msg",
          type: "cmd",
          body: {
            type: "pinMode",
            pin,
            mode: "output",
          },
        })
      );
    });
  }, []);

  return (
    <div className="App">
      <h1>ESP32 Control Panel</h1>
      <div className="py-2">
        <h2>INPUT (DIGITAL)</h2>
        <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-400">
          Select a Digital Pin
        </label>
        <div className="flex flex-row items-baseline">
          <select
            value={selectedDigitalInputPin}
            onChange={(e) => {
              const newPin = parseInt(e.target.value, 10);
              setSelectedDigitalInputPin(newPin);
            }}
            className="bg-gray-50 mr-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {digitalInputPins.map((pin, key) => (
              <option key={key} value={pin}>
                GPIO{pin}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="focus:outline-none w-52 text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
            onClick={(e) => {
              e.preventDefault();
              if (digitalInputPins.length < 1) {
                return;
              }
              setDigitalInputPins(
                digitalInputPins.filter(
                  (pin) => pin !== selectedDigitalInputPin
                )
              );
              setDigitalListenPins([
                ...digitalListenPins,
                selectedDigitalInputPin,
              ]);
              sendMessage(
                JSON.stringify({
                  action: "msg",
                  type: "cmd",
                  body: {
                    type: "pinMode",
                    pin: selectedDigitalInputPin,
                    mode: "input",
                  },
                })
              );
              sendMessage(
                JSON.stringify({
                  action: "msg",
                  type: "cmd",
                  body: {
                    type: "digitalListenAdd",
                    pin: selectedDigitalInputPin,
                  },
                })
              );
            }}
          >
            Digital Listen
          </button>
        </div>
        <div className="py-2">
          {digitalListenPins.length > 0 ? (
            <>
              <h3>Digital Pins</h3>
              <div className="flex flex-row flex-wrap justify-center">
                {digitalListenPins.map((digitalListenPin) => (
                  <div className="flex flex-row items-center py-2 mr-5">
                    <div
                      className={`${
                        pinsValueMap[digitalListenPin] === 1
                          ? "bg-cyan-400"
                          : ""
                      } w-8 h-8 mr-2 rounded-full border-solid border-8`}
                    ></div>
                    <span>GPIO{digitalListenPin}</span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setDigitalListenPins(
                          digitalListenPins.filter(
                            (pin) => pin !== digitalListenPin
                          )
                        );
                        setDigitalInputPins(
                          [...digitalInputPins, digitalListenPin].sort()
                        );
                        sendMessage(
                          JSON.stringify({
                            action: "msg",
                            type: "cmd",
                            body: {
                              type: "digitalListenRemove",
                              pin: digitalListenPin,
                            },
                          })
                        );
                      }}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="py-2">
        <h2>INPUT (ANALOG)</h2>
        <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-400">
          Select an Analog Pin
        </label>
        <div className="flex flex-row items-baseline">
          <select
            value={selectedAnalogInputPin}
            onChange={(e) => {
              const newPin = parseInt(e.target.value, 10);
              setSelectedAnalogInputPin(newPin);
            }}
            className="bg-gray-50 mr-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {analogInputPins.map((pin, key) => (
              <option key={key} value={pin}>
                GPIO{pin}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="focus:outline-none w-52 text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
            onClick={(e) => {
              e.preventDefault();
              if (analogInputPins.length < 1) {
                return;
              }
              setAnalogInputPins(
                analogInputPins.filter((pin) => pin !== selectedAnalogInputPin)
              );
              setAnalogListenPins([
                ...analogListenPins,
                selectedAnalogInputPin,
              ]);
              sendMessage(
                JSON.stringify({
                  action: "msg",
                  type: "cmd",
                  body: {
                    type: "pinMode",
                    pin: selectedAnalogInputPin,
                    mode: "input",
                  },
                })
              );
              sendMessage(
                JSON.stringify({
                  action: "msg",
                  type: "cmd",
                  body: {
                    type: "analogListenAdd",
                    pin: selectedAnalogInputPin,
                  },
                })
              );
            }}
          >
            Analog Listen
          </button>
        </div>
        <div className="py-2">
          {analogListenPins.length > 0 ? (
            <>
              <h3>Analog Pins</h3>
              <div className="flex flex-row flex-wrap justify-center">
                {analogListenPins.map((analogListenPin) => (
                  <div className="flex flex-row items-center py-2 mr-5">
                    <span>GPIO{analogListenPin}:</span>
                    <input
                      type="text"
                      id="first_name"
                      className="bg-gray-50 ml-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-12 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      readOnly={true}
                      value={pinsValueMap[analogListenPin] || "-"}
                    />
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setAnalogListenPins(
                          analogListenPins.filter(
                            (pin) => pin !== analogListenPin
                          )
                        );
                        setAnalogInputPins(
                          [...analogInputPins, analogListenPin].sort()
                        );
                        sendMessage(
                          JSON.stringify({
                            action: "msg",
                            type: "cmd",
                            body: {
                              type: "analogListenRemove",
                              pin: analogListenPin,
                            },
                          })
                        );
                      }}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
      <div>
        <h2>OUTPUT</h2>
        <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-400">
          Select a Pin
        </label>
        <select
          value={selectedOutputPin}
          onChange={(e) => {
            const newPin = parseInt(e.target.value, 10);
            setSelectedOuputPin(newPin);
            sendMessage(
              JSON.stringify({
                action: "msg",
                type: "cmd",
                body: {
                  type: "digitalRead",
                  pin: newPin,
                },
              })
            );
          }}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          {outputPins.map((pin, key) => (
            <option key={key} value={pin}>
              GPIO{pin}
            </option>
          ))}
        </select>
      </div>
      <div className="m-4">
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            checked={outPinValue}
            onChange={() => {
              const newValue = !outPinValue;

              setOutputPinValue(newValue);
              sendMessage(
                JSON.stringify({
                  action: "msg",
                  type: "cmd",
                  body: {
                    type: "digitalWrite",
                    pin: selectedOutputPin,
                    value: newValue ? 1 : 0,
                  },
                })
              );
            }}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {outPinValue ? "On" : "Off"}
          </span>
        </label>
      </div>
    </div>
  );
}

export default App;
