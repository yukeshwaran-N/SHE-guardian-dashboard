// src/pages/HelpSupport.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label"; // 👈 Added missing import
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  Download,
  Search,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create a new delivery request?",
        a: "To create a new delivery request, navigate to the Deliveries section and click on 'New Delivery'. Fill in the required information including woman's details, items to deliver, and scheduled date."
      },
      {
        q: "How do I register a new woman in the system?",
        a: "Go to Women Registry and click 'Add New Woman'. Fill in her personal details, health information, and assign an ASHA worker. The system will generate a unique ID automatically."
      },
      {
        q: "What are the different user roles?",
        a: "The system has two main roles: Admin (full access to all features) and Delivery Partner (access to deliveries and inventory management)."
      }
    ]
  },
  {
    category: "Deliveries",
    questions: [
      {
        q: "How do I update delivery status?",
        a: "In the Assigned Deliveries page, click on any delivery to open details. You can update status from 'Pending' to 'In Transit' to 'Delivered' as you progress."
      },
      {
        q: "What if a delivery is delayed?",
        a: "If a delivery is delayed, update the status and add a note explaining the reason. The system will notify the admin automatically."
      },
      {
        q: "Can I reschedule a delivery?",
        a: "Yes, you can reschedule by clicking on the delivery and selecting 'Reschedule'. Choose a new date and provide a reason."
      }
    ]
  },
  {
    category: "Inventory",
    questions: [
      {
        q: "How do I check low stock items?",
        a: "The Inventory page shows all items with quantity. Items below threshold are highlighted in red and marked as 'Low Stock'."
      },
      {
        q: "How to request new inventory?",
        a: "Click on 'Request Stock' in the Inventory page, select items and quantities. The request will be sent to admin for approval."
      }
    ]
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "How do I change my password?",
        a: "Go to Settings > Security section. Enter your current password and new password to update."
      },
      {
        q: "I forgot my password. What should I do?",
        a: "On the login page, click 'Forgot Password' and follow the instructions to reset via email."
      }
    ]
  }
];

const guides = [
  {
    title: "Admin User Guide",
    description: "Complete guide for administrators",
    icon: BookOpen,
    color: "blue",
    pages: 45
  },
  {
    title: "Delivery Partner Manual",
    description: "Step-by-step delivery instructions",
    icon: FileText,
    color: "green",
    pages: 32
  },
  {
    title: "Video Tutorials",
    description: "Watch and learn",
    icon: Video,
    color: "purple",
    pages: 12
  },
  {
    title: "API Documentation",
    description: "For developers",
    icon: FileText,
    color: "orange",
    pages: 78
  }
];

const contactMethods = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "24/7 helpline",
    contact: "+91 1800-123-4567",
    action: "Call now"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get reply within 24h",
    contact: "support@sakhi.gov.in",
    action: "Send email"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with support team",
    contact: "Available 9 AM - 6 PM",
    action: "Start chat"
  }
];

// Helper function to get color classes safely
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string, text: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
  };
  return colorMap[color] || { bg: "bg-gray-100", text: "text-gray-600" };
};

export default function HelpSupport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          How can we help you?
        </h1>
        <p className="text-muted-foreground mt-2">
          Search our knowledge base or contact support
        </p>
      </div>

      {/* Search Bar */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              className="pl-10 py-6 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Help Categories */}
      <div className="grid gap-4 md:grid-cols-5">
        {["all", "getting started", "deliveries", "inventory", "account"].map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className="w-full capitalize"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "all" ? "All" : cat}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {searchTerm ? (
                filteredFaqs.length > 0 ? (
                  filteredFaqs.map((category, idx) => (
                    <div key={idx} className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">{category.category}</h3>
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.questions.map((item, qIdx) => (
                          <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                            <AccordionTrigger className="text-left">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-muted-foreground">{item.a}</p>
                              <Button variant="link" className="mt-2 p-0">
                                Was this helpful?
                              </Button>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                    <Button variant="link" onClick={() => setSearchTerm("")}>
                      Clear search
                    </Button>
                  </div>
                )
              ) : (
                faqs.map((category, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <h3 className="font-semibold text-lg mb-3">{category.category}</h3>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((item, qIdx) => (
                        <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground">{item.a}</p>
                            <Button variant="link" className="mt-2 p-0">
                              Was this helpful?
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <div className="grid gap-4 md:grid-cols-2">
            {guides.map((guide, idx) => {
              const colors = getColorClasses(guide.color);
              return (
                <Card key={idx} className="hover-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                        <guide.icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{guide.title}</h3>
                        <p className="text-sm text-muted-foreground">{guide.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{guide.pages} pages</Badge>
                          <Button variant="link" className="p-0 h-auto">
                            Download <Download className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid gap-4 md:grid-cols-3">
            {contactMethods.map((method, idx) => (
              <Card key={idx} className="hover-card text-center">
                <CardContent className="p-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <method.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                  <p className="font-medium mt-3">{method.contact}</p>
                  <Button className="mt-4 w-full">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this about?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Describe your issue..." rows={5} />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Bar */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>All systems operational</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Average response time: 2 hours</span>
              <Badge variant="outline">Status Page</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}