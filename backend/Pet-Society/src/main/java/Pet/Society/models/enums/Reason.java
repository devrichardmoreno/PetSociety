package Pet.Society.models.enums;

public enum Reason {
    CONTROL(15, "CONTROL"), EMERGENCY(15, "EMERGENCY"), VACCINATION(15, "EMERGENCY"), NUTRITION(15, "EMERGENCY");

    private final int duration;
    private final String reason;

    Reason(int duration, String reason) {
        this.duration = duration;
        this.reason = reason;
    }

    public int getDuration() {
        return duration;
    }

    public String getReason() {
        return reason;
    }
}
