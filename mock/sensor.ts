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
          value: (Math.random() * 100).toFixed(2), // 只返回一个数值
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
          value: isSuccess ? (Math.random() * 100).toFixed(2) : null, // 只返回一个数值
          timestamp: new Date().toLocaleString("zh-CN"),
          status: isSuccess ? "success" : "error"
        };
      });

      return {
        success: true,
        data
      };
    }
  },
  {
    url: "/sensor/list",
    method: "post",
    response: () => {
      return {
        success: true,
        data: {
          list: [
            {
              SensorType: "Temperature",
              PortType: "TCP",
              SensorName: "温度传感器-A01",
              Enable: true,
              WSID: "WS001",
              Location: "车间A-1号线",
              EQPID: "EQP001",
              IP: "192.168.1.101",
              StationNo: 3,
              Port: 502,
              Com: "",
              LastUpdateUser: "admin",
              LastUpdateTime: "2024-01-20 10:30:00",
              SvidList: [
                { channel: "Channel1_S1", svid: "SVID001_S1", station: 1 },
                { channel: "Channel2_S1", svid: "SVID002_S1", station: 1 },
                { channel: "Channel3_S1", svid: "SVID003_S1", station: 1 },
                { channel: "Channel4_S1", svid: "SVID004_S1", station: 1 },
                { channel: "Channel5_S1", svid: "SVID005_S1", station: 1 },
                { channel: "Channel6_S1", svid: "SVID006_S1", station: 1 },
                { channel: "Channel7_S1", svid: "SVID007_S1", station: 1 },
                { channel: "Channel8_S1", svid: "SVID008_S1", station: 1 },
                { channel: "Channel1_S2", svid: "SVID001_S2", station: 2 },
                { channel: "Channel2_S2", svid: "SVID002_S2", station: 2 },
                { channel: "Channel3_S2", svid: "SVID003_S2", station: 2 },
                { channel: "Channel4_S2", svid: "SVID004_S2", station: 2 },
                { channel: "Channel5_S2", svid: "SVID005_S2", station: 2 },
                { channel: "Channel6_S2", svid: "SVID006_S2", station: 2 },
                { channel: "Channel7_S2", svid: "SVID007_S2", station: 2 },
                { channel: "Channel8_S2", svid: "SVID008_S2", station: 2 },
                { channel: "Channel1_S3", svid: "SVID001_S3", station: 3 },
                { channel: "Channel2_S3", svid: "SVID002_S3", station: 3 },
                { channel: "Channel3_S3", svid: "SVID003_S3", station: 3 },
                { channel: "Channel4_S3", svid: "SVID004_S3", station: 3 },
                { channel: "Channel5_S3", svid: "SVID005_S3", station: 3 },
                { channel: "Channel6_S3", svid: "SVID006_S3", station: 3 },
                { channel: "Channel7_S3", svid: "SVID007_S3", station: 3 },
                { channel: "Channel8_S3", svid: "SVID008_S3", station: 3 }
              ],
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
              PortType: "Serial",
              SensorName: "湿度传感器-B02",
              Enable: true,
              WSID: "WS002",
              Location: "车间B-2号线",
              EQPID: "EQP002",
              IP: "",
              StationNo: 2,
              Port: 0,
              Com: "COM3",
              LastUpdateUser: "operator",
              LastUpdateTime: "2024-01-21 14:20:00",
              SvidList: [
                { channel: "Channel1_S1", svid: "SVID101_S1", station: 1 },
                { channel: "Channel2_S1", svid: "SVID102_S1", station: 1 },
                { channel: "Channel3_S1", svid: "SVID103_S1", station: 1 },
                { channel: "Channel4_S1", svid: "SVID104_S1", station: 1 },
                { channel: "Channel5_S1", svid: "SVID105_S1", station: 1 },
                { channel: "Channel6_S1", svid: "SVID106_S1", station: 1 },
                { channel: "Channel7_S1", svid: "SVID107_S1", station: 1 },
                { channel: "Channel8_S1", svid: "SVID108_S1", station: 1 },
                { channel: "Channel1_S2", svid: "SVID101_S2", station: 2 },
                { channel: "Channel2_S2", svid: "SVID102_S2", station: 2 },
                { channel: "Channel3_S2", svid: "SVID103_S2", station: 2 },
                { channel: "Channel4_S2", svid: "SVID104_S2", station: 2 },
                { channel: "Channel5_S2", svid: "SVID105_S2", station: 2 },
                { channel: "Channel6_S2", svid: "SVID106_S2", station: 2 },
                { channel: "Channel7_S2", svid: "SVID107_S2", station: 2 },
                { channel: "Channel8_S2", svid: "SVID108_S2", station: 2 }
              ],
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
                }
              })
            },
            {
              SensorType: "Pressure",
              PortType: "TCP",
              SensorName: "压力传感器-C03",
              Enable: false,
              WSID: "WS003",
              Location: "车间C-3号线",
              EQPID: "EQP003",
              IP: "192.168.1.103",
              StationNo: 1,
              Port: 502,
              Com: "",
              LastUpdateUser: "admin",
              LastUpdateTime: "2024-01-19 09:15:00",
              SvidList: [
                { channel: "Channel1", svid: "SVID201", station: 1 },
                { channel: "Channel2", svid: "SVID202", station: 1 },
                { channel: "Channel3", svid: "SVID203", station: 1 },
                { channel: "Channel4", svid: "SVID204", station: 1 },
                { channel: "Channel5", svid: "SVID205", station: 1 },
                { channel: "Channel6", svid: "SVID206", station: 1 },
                { channel: "Channel7", svid: "SVID207", station: 1 },
                { channel: "Channel8", svid: "SVID208", station: 1 }
              ],
              SensorConfigs: JSON.stringify({
                General: {
                  unit: "Pa",
                  protocol: "TCP/IP",
                  enable: true
                },
                Range: {
                  min: 0,
                  max: 100000
                }
              })
            },
            {
              SensorType: "Flow",
              PortType: "TCP",
              SensorName: "流量传感器-D04",
              Enable: true,
              WSID: "WS004",
              Location: "车间D-1号线",
              EQPID: "EQP004",
              IP: "192.168.1.104",
              StationNo: 4,
              Port: 502,
              Com: "",
              LastUpdateUser: "operator",
              LastUpdateTime: "2024-01-22 16:45:00",
              SvidList: [
                { channel: "Channel1_S1", svid: "SVID301_S1", station: 1 },
                { channel: "Channel2_S1", svid: "SVID302_S1", station: 1 },
                { channel: "Channel3_S1", svid: "SVID303_S1", station: 1 },
                { channel: "Channel4_S1", svid: "SVID304_S1", station: 1 },
                { channel: "Channel5_S1", svid: "SVID305_S1", station: 1 },
                { channel: "Channel6_S1", svid: "SVID306_S1", station: 1 },
                { channel: "Channel7_S1", svid: "SVID307_S1", station: 1 },
                { channel: "Channel8_S1", svid: "SVID308_S1", station: 1 },
                { channel: "Channel1_S2", svid: "SVID301_S2", station: 2 },
                { channel: "Channel2_S2", svid: "SVID302_S2", station: 2 },
                { channel: "Channel3_S2", svid: "SVID303_S2", station: 2 },
                { channel: "Channel4_S2", svid: "SVID304_S2", station: 2 },
                { channel: "Channel5_S2", svid: "SVID305_S2", station: 2 },
                { channel: "Channel6_S2", svid: "SVID306_S2", station: 2 },
                { channel: "Channel7_S2", svid: "SVID307_S2", station: 2 },
                { channel: "Channel8_S2", svid: "SVID308_S2", station: 2 },
                { channel: "Channel1_S3", svid: "SVID301_S3", station: 3 },
                { channel: "Channel2_S3", svid: "SVID302_S3", station: 3 },
                { channel: "Channel3_S3", svid: "SVID303_S3", station: 3 },
                { channel: "Channel4_S3", svid: "SVID304_S3", station: 3 },
                { channel: "Channel5_S3", svid: "SVID305_S3", station: 3 },
                { channel: "Channel6_S3", svid: "SVID306_S3", station: 3 },
                { channel: "Channel7_S3", svid: "SVID307_S3", station: 3 },
                { channel: "Channel8_S3", svid: "SVID308_S3", station: 3 },
                { channel: "Channel1_S4", svid: "SVID301_S4", station: 4 },
                { channel: "Channel2_S4", svid: "SVID302_S4", station: 4 },
                { channel: "Channel3_S4", svid: "SVID303_S4", station: 4 },
                { channel: "Channel4_S4", svid: "SVID304_S4", station: 4 },
                { channel: "Channel5_S4", svid: "SVID305_S4", station: 4 },
                { channel: "Channel6_S4", svid: "SVID306_S4", station: 4 },
                { channel: "Channel7_S4", svid: "SVID307_S4", station: 4 },
                { channel: "Channel8_S4", svid: "SVID308_S4", station: 4 }
              ],
              SensorConfigs: JSON.stringify({
                General: {
                  unit: "L/min",
                  protocol: "Modbus TCP"
                },
                Range: {
                  min: 0,
                  max: 1000
                }
              })
            },
            {
              SensorType: "Level",
              PortType: "Serial",
              SensorName: "液位传感器-E05",
              Enable: true,
              WSID: "WS005",
              Location: "车间E-储罐区",
              EQPID: "EQP005",
              IP: "",
              StationNo: 1,
              Port: 0,
              Com: "COM5",
              LastUpdateUser: "admin",
              LastUpdateTime: "2024-01-23 11:00:00",
              SvidList: [
                { channel: "Channel1", svid: "SVID401", station: 1 },
                { channel: "Channel2", svid: "SVID402", station: 1 },
                { channel: "Channel3", svid: "SVID403", station: 1 },
                { channel: "Channel4", svid: "SVID404", station: 1 },
                { channel: "Channel5", svid: "NA", station: 1 },
                { channel: "Channel6", svid: "NA", station: 1 },
                { channel: "Channel7", svid: "NA", station: 1 },
                { channel: "Channel8", svid: "NA", station: 1 }
              ]
            }
          ],
          total: 5,
          pageSize: 10,
          currentPage: 1
        }
      };
    }
  }
]);
