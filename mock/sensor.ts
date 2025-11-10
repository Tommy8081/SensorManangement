import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  {
    url: "/sensor/types",
    method: "get",
    response: () => {
      return {
        success: true,
        data: [
          {
            SensorType: "Temperature",
            SensorDesc: "温度传感器",
            SensorConfigs: JSON.stringify({
              General: {
                unit: "℃",
                protocol: "Modbus RTU",
                enable: true
              },
              Range: {
                min: -40,
                max: 125,
                accuracy: 0.5
              },
              Communication: {
                baudRate: 9600,
                dataBits: 8,
                stopBits: 1,
                parity: "None",
                address: 1
              }
            })
          },
          {
            SensorType: "Humidity",
            SensorDesc: "湿度传感器",
            SensorConfigs: JSON.stringify({
              General: {
                unit: "%RH",
                protocol: "I2C",
                enable: true
              },
              Range: {
                min: 0,
                max: 100,
                accuracy: 2
              },
              Communication: {
                address: "0x40",
                timeout: 1000,
                interval: 500
              }
            })
          },
          {
            SensorType: "Pressure",
            SensorDesc: "压力传感器",
            SensorConfigs: JSON.stringify({
              General: {
                unit: "Pa",
                protocol: "TCP/IP",
                enable: true
              },
              Range: {
                min: 0,
                max: 100000,
                accuracy: 100
              },
              Communication: {
                port: 502,
                timeout: 3000
              }
            })
          },
          {
            SensorType: "Flow",
            SensorDesc: "流量传感器",
            SensorConfigs: JSON.stringify({
              General: {
                unit: "L/min",
                protocol: "Modbus TCP",
                enable: true
              },
              Range: {
                min: 0,
                max: 1000,
                accuracy: 1
              },
              Communication: {
                port: 502,
                timeout: 2000,
                interval: 1000
              }
            })
          },
          {
            SensorType: "Level",
            SensorDesc: "液位传感器",
            SensorConfigs: JSON.stringify({
              General: {
                unit: "m",
                protocol: "4-20mA",
                enable: true
              },
              Range: {
                min: 0,
                max: 10,
                accuracy: 0.01
              },
              Communication: {
                address: 2,
                timeout: 1500
              }
            })
          },
          {
            SensorType: "Vibration",
            SensorDesc: "振动传感器",
            SensorConfigs: JSON.stringify({
              General: {
                unit: "mm/s",
                protocol: "RS485",
                enable: true
              },
              Range: {
                min: 0,
                max: 50,
                accuracy: 0.1
              },
              Communication: {
                baudRate: 19200,
                dataBits: 8,
                stopBits: 1,
                parity: "Even",
                address: 3
              }
            })
          }
        ]
      };
    }
  },
  {
    url: "/sensor/type/:sensorType/config",
    method: "get",
    response: ({ params }) => {
      const configs = {
        Temperature: {
          General: {
            unit: "℃",
            protocol: "Modbus RTU",
            enable: true
          },
          Range: {
            min: -40,
            max: 125,
            accuracy: 0.5
          },
          Communication: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: "None",
            address: 1
          }
        },
        Humidity: {
          General: {
            unit: "%RH",
            protocol: "I2C",
            enable: true
          },
          Range: {
            min: 0,
            max: 100,
            accuracy: 2
          },
          Communication: {
            address: "0x40",
            timeout: 1000,
            interval: 500
          }
        },
        Pressure: {
          General: {
            unit: "Pa",
            protocol: "TCP/IP",
            enable: true
          },
          Range: {
            min: 0,
            max: 100000,
            accuracy: 100
          },
          Communication: {
            port: 502,
            timeout: 3000
          }
        },
        Flow: {
          General: {
            unit: "L/min",
            protocol: "Modbus TCP",
            enable: true
          },
          Range: {
            min: 0,
            max: 1000,
            accuracy: 1
          },
          Communication: {
            port: 502,
            timeout: 2000,
            interval: 1000
          }
        },
        Level: {
          General: {
            unit: "m",
            protocol: "4-20mA",
            enable: true
          },
          Range: {
            min: 0,
            max: 10,
            accuracy: 0.01
          },
          Communication: {
            address: 2,
            timeout: 1500
          }
        },
        Vibration: {
          General: {
            unit: "mm/s",
            protocol: "RS485",
            enable: true
          },
          Range: {
            min: 0,
            max: 50,
            accuracy: 0.1
          },
          Communication: {
            baudRate: 19200,
            dataBits: 8,
            stopBits: 1,
            parity: "Even",
            address: 3
          }
        }
      };

      const sensorKey = Array.isArray(params.sensorType)
        ? params.sensorType[0]
        : params.sensorType;
      return {
        success: true,
        data: configs[sensorKey as string] || {}
      };
    }
  },
  {
    url: "/sensor/svid/:svid/data",
    method: "get",
    response: ({ params }) => {
      const isSuccess = Math.random() > 0.2;

      if (!isSuccess) {
        return {
          success: false,
          message: "数据获取失败"
        };
      }

      return {
        success: true,
        data: {
          svid: params.svid,
          value: {
            temperature: (Math.random() * 100).toFixed(2),
            humidity: (Math.random() * 100).toFixed(2),
            pressure: (Math.random() * 1000).toFixed(2)
          },
          timestamp: new Date().toLocaleString("zh-CN")
        }
      };
    }
  },
  {
    url: "/sensor/svid/batch",
    method: "post",
    response: ({ body }) => {
      const { svidList } = body;

      const data = svidList.map(svid => {
        const isSuccess = Math.random() > 0.2;
        return {
          svid,
          value: isSuccess
            ? {
              temperature: (Math.random() * 100).toFixed(2),
              humidity: (Math.random() * 100).toFixed(2),
              pressure: (Math.random() * 1000).toFixed(2)
            }
            : null,
          timestamp: new Date().toLocaleString("zh-CN"),
          status: isSuccess ? "success" : "error"
        };
      });

      return {
        success: true,
        data
      };
    }
  }
]);
