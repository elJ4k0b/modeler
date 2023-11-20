export class Gesture
{
    constructor()
    {
        this.point1;
        this.point2;
        this.running = false;
    }
    start(pointers)
    {
        if(this.running) this.end(pointers);
        this.point1 = pointers[0];
        this.point2 = pointers[1];
        this.running = true;
    }
    do(pointers)
    {
        if(!this.running) this.start()
        this.point1 = pointers[0];
        this.point2 = pointers[1];
    }
    end(pointers)
    {
        this.running = false;
        this.point1 = pointers[0];
        this.point2 = pointers[1];
    }
}