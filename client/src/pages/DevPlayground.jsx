import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Share2, Download } from 'lucide-react';

const DevPlayground = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-8">Dev Playground - shadcn/ui Test</h1>

      {/* Section Buttons */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Buttons shadcn/ui</h2>
        <div className="bg-white p-6 rounded-lg space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="icon"><Heart className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline"><Share2 className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
          </div>
        </div>
      </section>

      {/* Section Input */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Input shadcn/ui</h2>
        <div className="bg-white p-6 rounded-lg space-y-4">
          <Input type="text" placeholder="Type something..." />
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Input disabled placeholder="Disabled input" />
        </div>
      </section>

      {/* Section Card & Avatar */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Card & Avatar shadcn/ui</h2>
        <div className="bg-white p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the card content area.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">User Profile</CardTitle>
                    <CardDescription>@username</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Card with avatar integration.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>With buttons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm">Action</Button>
                <Button className="w-full" size="sm" variant="outline">Cancel</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Zone libre */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Sandbox</h2>
        <div className="bg-white p-6 rounded-lg">
          {/* Tests libres */}
        </div>
      </section>
    </div>
  );
};

export default DevPlayground;
