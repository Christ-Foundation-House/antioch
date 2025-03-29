import {
  supabase,
  supabase_signIn,
  supabase_signOut,
  supabase_signUp,
} from "@/utils/supabase/client";
import { UserResponse } from "@supabase/supabase-js";
import { Button, Card, Col, Form, Input, List, Row, Statistic } from "antd";
import { env } from "process";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface socketUser {
  id: string;
  name: string;
  presence_ref: string;
  t: number;
}

interface socketMessage {
  id?: number;
  created_at?: string;
  message: string;
  socket_name?: string;
}
export default function page() {
  const [socket_name, setSocketUserId] = useState("");
  const channel_name = env.NEXT_PUBLIC_SUPABASE_TOPIC ?? "wicf-1";
  const topic_messages = "messages";
  const [input, setInput] = useState("");
  const [connectedUsers, setConnectedUsers] = useState<socketUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<socketMessage[]>([]);
  const [user, setUser] = useState<UserResponse["data"]["user"]>();

  // const user = await supabase.auth.getUser();
  const fetchData = async () => {
    const { data, error } = await supabase.from("messages").select("*");
    if (error) {
      console.error(error);
    } else {
      setMessages(data);
      scrollToBottom();
    }
  };

  const sendMessage = async ({ message }) => {
    const { error } = await supabase
      .from("messages")
      .insert([{ message, socket_name }]);

    if (error) {
      console.error("Error sending message:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  function onSubmit() {
    sendMessage({ message: input }).then(() => {
      setInput("");
    });
  }

  function shoutBroadcast() {
    const channel = supabase.channel(channel_name);
    channel.send({
      type: "broadcast",
      event: topic_messages,
      payload: { message: `Broadcast Shout from ${socket_name}` },
    });
    supabase.removeChannel(channel);
  }
  function messageReceived(payload: socketMessage) {
    setMessages((messagesPrev) => [...messagesPrev, payload]);
    scrollToBottom();
  }
  const messagesRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Function to scroll to the top
  const scrollToTop = () => {
    messagesRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    console.log("supabase-sub");
    const socketUserId_ = "user-id-" + Math.floor(Math.random() * 1000);
    setSocketUserId(socketUserId_);
    // Simple function to log any messages we receive

    const channel = supabase.channel(channel_name, {
      config: {
        presence: {
          key: socketUserId_,
        },
      },
    });
    channel
      .subscribe(async (status, error) => {
        // Wait for successful connection
        console.log("status", status);
        if (status !== "SUBSCRIBED") {
          setIsConnected(false);
          return null;
        }
        setIsConnected(true);
        await channel.track({});
        if (error) {
          console.log(error);
          toast.error(error.message);
        }
      })
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        // console.log(presenceState);

        let users: socketUser[] = [];
        Object.keys(presenceState).forEach((key) => {
          const user = { ...presenceState[key], id: key };
          users.push(user as unknown as socketUser);
        });
        // console.log(users);
        setConnectedUsers(users);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        toast.info(`${key} Joined the room`);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        toast.info(`${key} Left the room `);
      })
      .on("broadcast", { event: topic_messages }, (broadcast) => {
        console.log(broadcast);
        const { message } = broadcast.payload;
        message && toast.info(message);
      });

    const channelB = supabase.channel("messages");

    channelB.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        console.log(payload);
        const message: socketMessage = payload.new as any;
        messageReceived(message);
      },
    );
    channelB.subscribe();

    supabase.auth.getUser().then((res) => {
      res.data.user;
      setUser(res.data.user);
    });

    fetchData();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(channelB);
    };
  }, []);

  return (
    <Card
      title={`Realtime Test - My Id:${socket_name}`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
        border: 0,
      }}
    >
      <Row
        gutter={[0, 0]}
        style={{ display: "flex", justifyContent: "center", gap: 10 }}
      >
        <Statistic title="Connected Users" value={connectedUsers.length} />
        <Statistic title="Messages" value={messages.length} />
        <Statistic
          title="Is Connected?"
          valueStyle={{ color: isConnected ? "green" : "red" }}
          value={isConnected ? "Yes" : "No"}
        />
      </Row>
      <Row
        gutter={[0, 0]}
        style={{ display: "flex", justifyContent: "center", gap: 10 }}
      >
        <Statistic
          title="Email"
          value={user?.email}
          valueStyle={{ color: "white" }}
        />
        <Statistic title="Messages" value={messages.length} />
      </Row>
      <Row gutter={[24, 24]}>
        <Col
          sm={24}
          md={20}
          style={{
            display: "flex",
            gap: 5,
            flexDirection: "column",
            alignItems: "center",
            // overflow: "scroll",
            // maxHeight: 300,
          }}
        >
          <Card
            style={{
              backgroundColor: "transparent",
              border: 0,
              width: "100%",
            }}
            title="Messages"
          >
            <div
              ref={messagesRef}
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                overflowX: "hidden",
                marginTop: "20px",
              }}
            >
              <List
                dataSource={messages}
                grid={{ gutter: 24, column: 1 }}
                renderItem={(item) => (
                  <Button style={{ marginBottom: 5 }}>
                    {`${item.socket_name}: ${item.message}`}
                  </Button>
                )}
              ></List>
            </div>
          </Card>
        </Col>
        <Col
          sm={24}
          md={4}
          style={{
            display: "flex",
            gap: 5,
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Card
            title="Connected users"
            style={{
              backgroundColor: "transparent",
              border: 0,
              width: "100%",
            }}
          >
            <List
              dataSource={connectedUsers}
              grid={{ gutter: 24, column: 1 }}
              renderItem={(user) => (
                <Button style={{ marginBottom: 5 }}>
                  {user.name ?? user.presence_ref ?? user.id}
                </Button>
              )}
            ></List>
          </Card>
        </Col>
        <Col
          span={24}
          style={{
            width: "100%",
          }}
        >
          <Form
            onFinish={(e) => {
              onSubmit();
            }}
            style={{ width: "100%" }}
          >
            <Form.Item>
              <Input.TextArea
                value={input}
                placeholder="Message"
                style={{
                  width: "100%",
                  height: 50,
                  border: "1px solid grey",
                  padding: 5,
                }}
                minLength={2}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                disabled={!isConnected}
                style={{
                  margin: 10,
                  padding: 5,
                }}
                htmlType="submit"
              >
                Push Message
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  shoutBroadcast();
                }}
              >
                Shout Hi
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col
          span={24}
          style={{
            width: "100%",
          }}
        >
          <Card
            title="Login"
            style={{
              backgroundColor: "transparent",
            }}
            extra={[
              user && (
                <Button
                  onClick={() => {
                    supabase_signOut;
                  }}
                >
                  Log Out
                </Button>
              ),
            ]}
          >
            <Form
              onFinish={(data) => {
                console.log("submit", data);
                const { email, password } = data;
                if (!email || !password) {
                  toast.error("Fill both password and email");
                }
                supabase_signIn(email, password)
                  .then(() => {
                    toast.success("Successfully Logged in");
                  })
                  .then((error) => {
                    console.error(error);
                    toast.error("Something went wrong");
                  });
              }}
              style={{ width: "100%" }}
            >
              <Form.Item
                name={"email"}
                label="Email"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Email"
                  type="email"
                  style={{
                    width: "100%",
                    height: 50,
                    border: "1px solid grey",
                    padding: 5,
                  }}
                  minLength={2}
                />
              </Form.Item>
              <Form.Item
                name={"password"}
                label="Password"
                rules={[{ required: true }]}
              >
                <Input.Password
                  placeholder="Password"
                  style={{
                    width: "100%",
                    height: 50,
                    border: "1px solid grey",
                    padding: 5,
                  }}
                  minLength={2}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  disabled={!!user}
                  style={{
                    margin: 10,
                    padding: 5,
                  }}
                  htmlType="submit"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Card>
          <Card
            title="Register"
            style={{
              backgroundColor: "transparent",
            }}
          >
            <Form
              onFinish={(data) => {
                console.log("submit", data);
                const { email, password } = data;
                if (!email || !password) {
                  toast.error("Fill both password and email");
                }
                supabase_signUp(email, password)
                  .then(() => {
                    toast.success("Successfully Logged in");
                  })
                  .then((error) => {
                    console.error(error);
                    toast.error("Something went wrong");
                  });
              }}
              style={{ width: "100%" }}
            >
              <Form.Item
                name={"email"}
                label="Email"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Email"
                  type="email"
                  style={{
                    width: "100%",
                    height: 50,
                    border: "1px solid grey",
                    padding: 5,
                  }}
                  minLength={2}
                />
              </Form.Item>
              <Form.Item
                name={"password"}
                label="Password"
                rules={[{ required: true }]}
              >
                <Input.Password
                  placeholder="Password"
                  style={{
                    width: "100%",
                    height: 50,
                    border: "1px solid grey",
                    padding: 5,
                  }}
                  minLength={2}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  disabled={!!user}
                  style={{
                    margin: 10,
                    padding: 5,
                  }}
                  htmlType="submit"
                >
                  Signup
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
