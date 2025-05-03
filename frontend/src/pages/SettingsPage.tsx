import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Switch, Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface HealthProfile {
  age: number;
  gender: string;
  medicalHistory: string[];
  lifestyle: {
    activityLevel: 'sedentary' | 'moderate' | 'active';
    diet: 'omnivore' | 'vegetarian' | 'vegan';
    sleepPattern: 'regular' | 'irregular';
  };
  preferences: {
    healthFocus: string[];
    language: string;
    notificationPreferences: {
      reminders: boolean;
      updates: boolean;
    };
  };
}

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<HealthProfile | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('healthProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      form.setFieldsValue(JSON.parse(savedProfile));
    }
  }, [form]);

  const onFinish = (values: HealthProfile) => {
    localStorage.setItem('healthProfile', JSON.stringify(values));
    setProfile(values);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
        Profile Settings
      </Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={profile || {
            lifestyle: {
              activityLevel: 'moderate',
              diet: 'omnivore',
              sleepPattern: 'regular'
            },
            preferences: {
              notificationPreferences: {
                reminders: true,
                updates: true
              }
            }
          }}
        >
          <Form.Item
            label="Age"
            name="age"
            rules={[{ required: true, message: 'Please input your age!' }]}
          >
            <Input type="number" min={1} max={120} />
          </Form.Item>

          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: 'Please select your gender!' }]}
          >
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Medical History"
            name="medicalHistory"
          >
            <Select mode="tags" placeholder="Add medical conditions">
              <Option value="diabetes">Diabetes</Option>
              <Option value="hypertension">Hypertension</Option>
              <Option value="asthma">Asthma</Option>
              <Option value="allergies">Allergies</Option>
            </Select>
          </Form.Item>

          <Title level={4}>Lifestyle</Title>

          <Form.Item
            label="Activity Level"
            name={['lifestyle', 'activityLevel']}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="sedentary">Sedentary</Option>
              <Option value="moderate">Moderate</Option>
              <Option value="active">Active</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Diet"
            name={['lifestyle', 'diet']}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="omnivore">Omnivore</Option>
              <Option value="vegetarian">Vegetarian</Option>
              <Option value="vegan">Vegan</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Sleep Pattern"
            name={['lifestyle', 'sleepPattern']}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="regular">Regular</Option>
              <Option value="irregular">Irregular</Option>
            </Select>
          </Form.Item>

          <Title level={4}>Preferences</Title>

          <Form.Item
            label="Health Focus Areas"
            name={['preferences', 'healthFocus']}
          >
            <Select mode="multiple" placeholder="Select areas of focus">
              <Option value="nutrition">Nutrition</Option>
              <Option value="exercise">Exercise</Option>
              <Option value="mental">Mental Health</Option>
              <Option value="sleep">Sleep</Option>
              <Option value="stress">Stress Management</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Language"
            name={['preferences', 'language']}
            initialValue="en"
          >
            <Select>
              <Option value="en">English</Option>
              <Option value="pt">Portuguese</Option>
              <Option value="es">Spanish</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Enable Reminders"
            name={['preferences', 'notificationPreferences', 'reminders']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Enable Updates"
            name={['preferences', 'notificationPreferences', 'updates']}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Save Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage; 