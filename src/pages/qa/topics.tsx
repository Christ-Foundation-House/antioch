import React from "react";
import { useRouter } from "next/router";
import { Button, List, message } from "antd";
import { api } from "@/utils/api";

const TopicsList = () => {
  const router = useRouter();
  const { data: topics, isLoading } = api.qa.getTopics.useQuery();

  const handleTopicClick = (topicId: number) => {
    router.push(`/qa/questions?topicId=${topicId}`);
  };

  return (
    <div className="container mx-auto p-4" style={{ height: "100%" }}>
      <h1 className="text-2xl font-bold mb-4">Available Topics</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <List
          bordered
          dataSource={topics}
          renderItem={(topic) => (
            <List.Item>
              <Button type="link" onClick={() => handleTopicClick(topic.id)}>
                {topic.name}
              </Button>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default TopicsList;
